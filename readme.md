# DSensors

DSensors monitoring/smarthome simple solution
by Peter Sobolev (frog)
frog@enlight.ru


client/ - web app. Dashboard (reactjs+apollo client).  server/. 
         dev: http://localhost:5173/ prod: https://localhost/


server/ - server (nodejs + express + postgraphile). postgres db (schema .dsensors).

Endpoints:
1) graphql debug UI: https://localhost:3000/graphiql
2) graphql POST requests from dashboard web app: https://localhost:3000/graphql
3) json POST requests from devices: https://localhost/api
4) static html/css (for prod client): https://localhost/

esp32/ - esp32 .c code (sends requests to #3)
misc/ - diagrams, etc
server_php/ - initial php server (unused)


To run client/server in dev mode: rundev.cmd
To run prod: 1) build (build.cmd) 2) run server (cd server && npm start) 3) open prod on localhost
To run prod on linux use pm2 start server/src/dsensors.js


