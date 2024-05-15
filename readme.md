# DSensors

DSensors monitoring/smarthome simple solution<br/>
frog@enlight.ru
<p>

![ScreenShot](/ss_dsensors.png)

<p>client/ - web app. Dashboard (reactjs + apollo client).  

<p>server/ - server (nodejs + express + postgraphile). postgres db (schema .dsensors).

<p>Endpoints:
<p>1) graphql debug UI: https://localhost:3000/graphiql<br/>
2) graphql POST requests from dashboard web app: https://localhost:3000/graphql<br/>
3) json POST requests from devices: https://localhost/api<br/>
4) static html/css (for prod client): https://localhost/

<p>esp32/ - esp32 .c code (sends requests to #3)<br/>


<p>To run client/server in dev mode: rundev.cmd<br/>
To run prod: 1) build (build.cmd) 2) run server (cd server && npm start) 3) open prod on localhost<br/>
To run prod on linux use pm2 start server/src/dsensors.js


<p>MIT license
