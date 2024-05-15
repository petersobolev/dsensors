DROP SCHEMA IF EXISTS dsensors CASCADE;
CREATE SCHEMA dsensors;

SET search_path TO dsensors;


-- locations
CREATE TABLE st_locs (
	id serial primary key, -- autoincremented id
	loc integer default 1 unique,
	name varchar NULL -- name of loc (e.g. 'cottage')
);

-- sources
-- also contain answer for POST request from device (to control settings/ relays)
CREATE TABLE st_srcs (
	id serial primary key, -- autoincremented id
	loc integer default 1 references st_locs(loc),
	src integer default 1,
	name varchar NULL, -- name of source (e.g. 'device at dacha')
	relay1 integer default 0, -- set to 0/1 to disable/enable relay 1
	relay2 integer default 0, -- set to 0/1 to disable/enable relay 2
	period integer default 300, -- seconds between POST requests
	reset integer default 0, -- set to 1 to reset device (do not forget to return back to 0 afterwards!)
	sleep integer default 0 -- set to 0/1 to disable/enable sleep between requests

);


CREATE TABLE st_main (
	id serial primary key, -- autoincremented id, to link other tables
	loc integer, -- location (city, cottage etc) 1
	src integer, -- place (2nd floor, first floor etc) 1
	dt_crt timestamp default now(),
	count bigint, -- loop iterations since reset
	fl integer, -- "1" for first loop iteration
	heap integer, -- current heap (bytes)
	w_rssi integer, -- Wi-Fi RSSI
	w_time varchar, -- local ESP32 time (hopefully synced from NTP), as text
	w_time_ut bigint, -- local ESP32 time (hopefully synced from NTP), as unixtime
	uptime bigint, -- time passed since reset
	bt_found integer, -- BT devices found
	ups_v real, -- voltage
	ups_sv real, -- shunt voltage
	ups_c real, -- current
	ups_p real -- power
);

CREATE INDEX st_main_src_idx ON st_main (src,loc);


-- switch sensors
CREATE TABLE st_rswitch (
	id serial primary key, -- autoincremented id
	main_id integer references st_main, 
	loc integer, -- 1
	src integer, -- 1
	dt_crt timestamp default now(), -- server time, ISO
	i integer, -- sensor index
	s real -- "1" if switch status changed
);


-- motion sensors
CREATE TABLE st_motion (
	id serial primary key, -- autoincremented id
	main_id integer references st_main, 
	loc integer, -- 1
	src integer, -- 1
	dt_crt timestamp default now(), -- server time, ISO
	i integer, -- sensor index
	m real -- "1" if motion detected
);

-- voltage sensors
CREATE TABLE st_v (
	id serial primary key, -- autoincremented id
	main_id integer references st_main, 
	loc integer, -- 1
	src integer, -- 1
	dt_crt timestamp default now(), -- server time, ISO
	i integer, -- sensor index
	v real -- voltage from sensor
);


-- onewire temperature sensors
CREATE TABLE st_ot (
	id serial primary key, -- autoincremented id
	main_id integer references st_main, 
	loc integer, -- 1
	src integer, -- 1
	dt_crt timestamp default now(), -- server time, ISO
	i integer, -- sensor index
	t real -- temperature
);

-- BLE sensors (t/h)
CREATE TABLE st_bt (
	id serial primary key, -- autoincremented id
	main_id integer references st_main, 
	loc integer, -- 1
	src integer, -- 1
	dt_crt timestamp default now(), -- server time, ISO
	name varchar, -- name
	addr macaddr, -- addr (MAC)
	t real, -- temperature
	h real, -- humidity
	bv real, -- battery voltage
	bl real, -- battery level
	valid integer, -- "1" for t/h devices (with serviceUUID = 0x181a)
	rssi integer, -- rssi
	suuid varchar, -- service UUID
	sdata varchar, -- service data
	mdata varchar -- manufacturer data
);



CREATE TABLE st_widgets (
	id serial primary key, -- autoincremented id
	loc integer default 1,
	src integer default 1,
	dt_crt timestamp default now(), -- server time, ISO
	widget varchar NULL, -- group of sensors (must be matched to tables - ot, bt, v, rswitch, motion)
	i varchar NULL, -- index or addr (0, 1, 2, f4:c1:38:be:5f, etc)
	vmin real NULL, -- min acceptable value
	vmax real NULL, -- max acceptable value
	name varchar NULL, -- name on card ('outdoor', 'device', 'ups' etc)
	sort integer NULL, -- to show cards in order
	active integer default 1 -- to show or hide widget
);





CREATE OR REPLACE FUNCTION update_custom_src(_loc int, _src int, _relay1 int, _relay2 int, _period int, _reset int, _sleep int)
returns setof st_srcs as $$

declare
	st_srcs st_srcs;

begin

SET search_path TO dsensors;
	

UPDATE st_srcs SET relay1 = _relay1, relay2 = _relay2, period = _period, reset = _reset, sleep = _sleep WHERE loc = _loc AND src = _src;

	
	return query SELECT * FROM st_srcs WHERE loc = _loc AND src = _src limit 1;
	
end;

$$ LANGUAGE plpgsql;




-- initialize with values
INSERT INTO st_locs (loc,name) VALUES 
	(1,'cottage'),
	(2,'city'),
	(999,'test');


-- initialize with values
INSERT INTO st_srcs (loc,src,name,relay1,relay2,period,reset,sleep) VALUES 
	(1,1,'device at dacha',0,0,300,0,0),
	(2,1,'device in city',0,0,300,0,0),
	(999,1,'test device',0,0,300,0,0);



-- initialize with values
INSERT INTO st_widgets (widget,i,vmin,vmax,name,sort,loc,src,active) VALUES
	('ot','2',0.0,28.0,'indoor f2',30,1,1,1),
	('v','1',200.0,250.0,'ups',80,1,1,1),
	('v','2',200.0,250.0,'grid',70,1,1,1),
	('rswitch',NULL,1.0,1.0,'door f2',100,1,1,0),
	('motion','1',1.0,1.0,'stairs f2',90,1,1,1),
	('motion','2',1.0,1.0,'room f2',95,1,1,1),
	('div',NULL,NULL,NULL,NULL,35,1,1,1),
	('div',NULL,NULL,NULL,NULL,65,1,1,1),
	('div',NULL,NULL,NULL,NULL,105,1,1,1),
	('bt','e4:c1:38:be:5f:19',0.0,30.0,'kitchen pipes',50,1,1,1),
	('bt','e4:c1:38:8f:5e:e0',3.0,27.0,'AGM batteries',60,1,1,1),
	('ot','0',0.0,30.0,'device f2',20,1,1,1),
	('bt','e4:c1:38:43:10:a7',0.0,30.0,'bathroom pipes',40,1,1,1),
	('ot','1',-30.0,30.0,'outdoor',10,1,1,1),
	('div',NULL,NULL,NULL,NULL,85,1,1,1),
	('battery',NULL,20.0,100.0,'Li battery',83,1,1,1),
	('btcount',NULL,1.0,20.0,'BLE counter',110,1,1,1),
	('debug',NULL,100000.0,150000.0,'debug',120,1,1,1);




