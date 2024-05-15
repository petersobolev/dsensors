

console.log('Running dsensors...');

const express = require("express");
const { postgraphile } = require("postgraphile");
const fs = require("fs");
const https = require("https");
const path = require("path"); 

const { Pool } = require ("pg");

const { cfg } = require("./dsensors_cfg");


const certs = {
  key: fs.readFileSync(`${cfg.certs}privkey.pem`),
  cert: fs.readFileSync(`${cfg.certs}fullchain.pem`),
};

const pool = new Pool({
  user: cfg.postgres_user,
  password: cfg.postgres_password,
  host: cfg.postgres_host,
  port: cfg.postgres_port,
  database: cfg.postgres_dbname,
  min: cfg.postgres_min,
  max: cfg.postgres_max
});

  
pool.on('error', error => {
  console.error('Postgres generated pool error!', error)
})

const appDevice = express();
const appWeb = express();
const appPgf = express();

const httpsServerAppPgf = https.createServer(certs, appPgf);
const httpsServerAppDevice = https.createServer(certs, appDevice);
const httpsServerAppWeb = https.createServer(certs, appWeb);

httpsServerAppPgf.listen(3000, () => {
  console.log('HTTP Server running on port 3000 (postgraphile)');
});

httpsServerAppDevice.listen(4000, () => {
//appDevice.listen(4000, () => {
  console.log('HTTP Server running on port 4000 (device API)');
});
httpsServerAppWeb.listen(8080, () => {
  console.log('HTTP Server running on port 8080 (web dashboard)');
});





appPgf.use(
  postgraphile(
    process.env.DATABASE_URL || `postgres://${cfg.postgres_user}:${cfg.postgres_password}@${cfg.postgres_host}:${cfg.postgres_port}/${cfg.postgres_dbname}`,
    cfg.postgres_schema,
    {
      graphqlRoute: `${cfg.project_dir}/graphql`,
      graphiqlRoute: `${cfg.project_dir}/graphiql`,
      watchPg: true,
      graphiql: true,
      enhanceGraphiql: true,
      enableCors: true,
      allowExplain: (req) => { return false; } // required for explain on/off in graphiql UI
    }
  )
);


appWeb.get(`${cfg.project_dir}`, function requestHandler(req, res) {

	console.log('sendfile', path.join(__dirname, "../dist", "index.html") );

	res.sendFile(path.join(__dirname, "../dist", "index.html"));
});


appWeb.use(`${cfg.project_dir}/assets`, express.static(__dirname + '/../dist/assets'));


appDevice.use(express.json());


appDevice.post(`${cfg.project_dir}/api`, async function(request, response){
  
  console.log('api request loc,src',request.body.loc, request.body.src);      // your JSON
//  console.log('api request',request.body);      // your JSON

  const query = `INSERT INTO ${cfg.postgres_schema}.st_main (loc,src,count,uptime,fl,heap,w_rssi,w_time,w_time_ut,bt_found,ups_v,ups_sv,ups_c,ups_p) VALUES	($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)	RETURNING id`;
  
  const result = await pool.query(query,[request.body.loc,	request.body.src,	request.body.count,	request.body.uptime,	request.body.fl,	request.body.heap,	request.body.w_rssi,	request.body.w_time,	request.body.w_time_ut,	request.body.bt_found,	request.body.ups_v,	request.body.ups_sv,	request.body.ups_c,	request.body.ups_p]);

  const inserted_id = result.rows[0].id;

  console.log('inserted_id:',inserted_id);

  let promises;

  // BT
  if (request.body.bt)
    promises = request.body.bt.map(item => {
      return pool.query(`INSERT INTO ${cfg.postgres_schema}.st_bt (main_id, loc, src, name, addr, t, h, bv, bl, valid, rssi, suuid, sdata, mdata)  VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) `, [inserted_id, Number(request.body.loc), Number(request.body.src), item.name, item.addr, Number(item.t), Number(item.h), Number(item.bv), Number(item.bl), Number(item.valid), Number(item.rssi), item.suuid, item.sdata, item.mdata]);
    })
  
  await Promise.all(promises)

  // OT
  if (request.body.ot)
    promises = request.body.ot.map(item => {
      return pool.query(`INSERT INTO ${cfg.postgres_schema}.st_ot (main_id, loc, src, i, t)  VALUES 
      ($1, $2, $3, $4, $5) `, [inserted_id, Number(request.body.loc), Number(request.body.src), Number(item.i), Number(item.t)]);
    })
  
  await Promise.all(promises)
 
  // RSWITCH
  if (request.body.rswitch)
    promises = request.body.rswitch.map(item => {
      return pool.query(`INSERT INTO ${cfg.postgres_schema}.st_rswitch (main_id, loc, src, i, s)  VALUES 
      ($1, $2, $3, $4, $5) `, [inserted_id, Number(request.body.loc), Number(request.body.src), Number(item.i), Number(item.s)]);
    })

  await Promise.all(promises)
 
  // MOTION
  if (request.body.motion)
    promises = request.body.motion.map(item => {
      return pool.query(`INSERT INTO ${cfg.postgres_schema}.st_motion (main_id, loc, src, i, m)  VALUES 
      ($1, $2, $3, $4, $5) `, [inserted_id, Number(request.body.loc), Number(request.body.src), Number(item.i), Number(item.m)]);
    })

  await Promise.all(promises)
  

  // V
  if (request.body.v)
    promises = request.body.v.map(item => {
      return pool.query(`INSERT INTO ${cfg.postgres_schema}.st_v (main_id, loc, src, i, v)  VALUES 
      ($1, $2, $3, $4, $5) `, [inserted_id, Number(request.body.loc), Number(request.body.src), Number(item.i), Number(item.v)]);
    })

  await Promise.all(promises)



  const res = await pool.query(`SELECT * FROM ${cfg.postgres_schema}.st_srcs WHERE loc=$1 AND src=$2`,[Number(request.body.loc), Number(request.body.src)]);

  //console.log('res',res);

  //response.set({'Content-Type': 'application/json'});
  response.json( {
    "relay1" : res.rows[0].relay1 ? "on" : "off", 
    "relay2" : res.rows[0].relay2 ? "on" : "off", 
    "period" : res.rows[0].period, 
    "reset" : res.rows[0].reset ? true : false, 
    "sleep" : res.rows[0].sleep ? true : false 
  }  );    // echo result back

});




