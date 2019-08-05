
//**********************************************************************
 X3D PostGIS Server 
//**********************************************************************

//Dependencias
nodejs
npm install pg-promise
npm install local-web-server//  v3.0

//este ejemplo se basa en 
https://github.com/lwsjs/local-web-server/wiki/How-to-prototype-a-REST-API
y en 
https://www.npmjs.com/package/lws



Este codigo implementa un servidor de X3D que envia peticiones aPostgis usando sfcgal por medio de

postgis_x3d_server.js


El backend de Postgis es un servicio web que recibe peticiones via http y las redirige a postgis y sfcgal.

El resultado del servicio web se expresa via x3d.


**************************************
EJECUCION
*************************************
el servidor se ejecuta via

ws --mocks postgis_x3d_server.js

y se accede via el url

http://localhost:8000/getX3D
http://localhost:8000/getPostgis