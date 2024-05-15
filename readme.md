# DSensors

DSensors monitoring/smarthome simple solution<br/>
by Peter Sobolev (frog)<br/>
frog@enlight.ru<br/>

![ScreenShot](/ss_dsensors.png)

<p>client/ - web app. Dashboard (reactjs+apollo client).  server/. <br/>
         dev: http://localhost:5173/ prod: https://localhost/


<p>server/ - server (nodejs + express + postgraphile). postgres db (schema .dsensors).

<p>Endpoints:<br/>
1) graphql debug UI: https://localhost:3000/graphiql<br/>
2) graphql POST requests from dashboard web app: https://localhost:3000/graphql<br/>
3) json POST requests from devices: https://localhost/api<br/>
4) static html/css (for prod client): https://localhost/

<p>esp32/ - esp32 .c code (sends requests to #3)<br/>
misc/ - diagrams, etc<br/>
server_php/ - initial php server (unused)


<p>To run client/server in dev mode: rundev.cmd<br/>
To run prod: 1) build (build.cmd) 2) run server (cd server && npm start) 3) open prod on localhost<br/>
To run prod on linux use pm2 start server/src/dsensors.js


