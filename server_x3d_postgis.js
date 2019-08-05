//Pequeño server que implementa microservicios para devolver x3d via postgis
//se ejecuta por medio de 
//$ npx lws --stack body-parser server_x3d_postgis.js




console.log('X3D SFCGAL POSTGIS SERVER  V0.1');

//codigo de conexion con PGPROMISE

const initOptions = {/* initialization options */ };
const pgp = require('pg-promise')(initOptions);
//const consultas = require('./spatialFunctions');


const connection = {
  host: 'localhost',
  port: 5432,
  database: 'TemasSelectosCIG',
  user: 'postgres',
  password: 'postgresdb'
};
const db = pgp(connection);




//definicion del recurso para obtener X3D
async function getX3D(ctx) {

  console.log("GET getX3D");

  console.log(ctx.request.url)//mostrar la ruta completa de la peticion
  console.log(ctx.request.querystring)//el querystring pero como una cadena
  console.log(ctx.request.body)


  var parametros = ctx.request.query;//el query como un objeto
  var sql = ctx.request.body.sql;//el query como un objeto
  var bvals = ctx.request.body.bvals;//el query como un objeto
  var geometry = ctx.request.body.spatial_type;//el query como un objeto

  console.log(sql);
  console.log(bvals);
  console.log(geometry);
  //aqui vamos a utilizar algunos parametros
  // let sqlReplacements = { municipio_id: 499 };
  let sqlReplacements = {  };

 
   sql= sql.replace(/'/g, "\'\'");
  let sqlminQuery = 'select mun2.id  id, mun2.cvemuni cvemuni, mun2.nom_mun, mun2.layer, st_asgeojson(   st_transform(st_setsrid(mun2.geom,6372),4326)  ) json from municipios_2000 mun1, municipios_2000 mun2 where st_touches(mun1.geom,mun2.geom) and mun1.id <> mun2.id and mun1.id = ${municipio_id}  ';

  let query='SELECT postgis_viewer_x3d(\'' + sql +'\', \''+ geometry +'\',array['+ bvals+']);';
  console.log(query)  
  let resultados = await db.any(query, sqlReplacements);//esperamos los resultados de la consulta con await
  //console.log(results);


 

  // //iteramos sobre el arreglo de respuestas o results, es decir, para cada resultado_i ejecutamos una pieza de codigo que crea un feature
  // resultados.forEach(function (resultado_i) {
  //   //creamos una plantilla para cada feature
  //   //los properties son especificas de cada fila.
  //   //aunque hay manera de automatizar los properties que se agregan, eso queda fuera del alcance de la practica, sorry =(
  //   console.log(resultado_i);
  //   let feature = {
  //     "type": "Feature",
  //     "id": resultado_i.id,
  //     "geometry": JSON.parse(resultado_i.json),
  //     "geometry_name": "geom",
  //     "properties": {
  //       "id": resultado_i.id,  //<= muevanle aqui
  //       "cve_muni": resultado_i.cvemuni, //<= aqui,
  //       "nom_mun": resultado_i.nom_mun,//<= aqui
  //       "layer": resultado_i.layer//<= y  aqui
  //       //si faltan mas cosas, agregarlas
  //     }
  //   };
  //   //console.log(JSON.stringify(feature));//por si quisiera ver el contenido de cada iteracion
  //   //revisar https://www.w3schools.com/jsref/jsref_push.asp para mas informacion de push()
  //   geoJSONResult.features.push(feature);//agregamos el feature al arreglo numFeatures
  // });

  //un poco de cortesia al programador
  // console.log("Registros agregados: " + geoJSONResult.features.length);
  // geoJSONResult.totalFeatures = geoJSONResult.features.length;//actualizando el numero de registros de GeoJSON
  console.log(resultados);
  ctx.body = resultados;//devolviendo los resultados.
}

//definicion del recurso para obtener X3D
async function getX3Dmock(ctx) {

  console.log("GET getX3Dmock");
  console.log(ctx.request.url)//mostrar la ruta completa de la peticion
  console.log(ctx.request.querystring)//el querystring pero como una cadena


  var parametros = ctx.request.query;//el query como un objeto

  //aqui vamos a utilizar algunos parametros
  
  ctx.body = '';//devolviendo los resultados.
}


//por si se desea personalizar
async function postgisQuery(ctx, customFunction) {

  //la documentacion de estos metodos esta en :
  //https://github.com/koajs/koa/blob/master/docs/api/request.md

  console.log("GET getPostgis");

  console.log(ctx.request.url)//mostrar la ruta completa de la peticion
  console.log(ctx.request.querystring)//el querystring pero como una cadena

  var parametros = ctx.request.query;//el query como un objeto
  if (parametros.start != null) {
    console.log(parametros.start);
  }

  //se espera contar con un minimo de parametros para enviar a la consulta
  // maxResults=10
  //
  let maxResults = 10;
  let layer


  //https://github.com/koajs/koa/blob/master/docs/troubleshooting.md

  //aqui es donde la magia resulta, ya que aqui se realiza la consulta a Posgis y se devuelve el JSON

  let sqlQuery = 'SELECT id,cvemuni,layer,nom_mun,st_asgeojson(st_transform(st_setsrid(geom,6372),4326)) json from municipios_2000 where id < ${numFeatures}';
  let sqlReplacements = { numFeatures: 100 };

  ctx.body = await getResults(sqlQuery, sqlReplacements);//esto se puede hacer un poco mas modular
  console.log('fin');
}



//funcion asincrona para obtener resultados de la db y formatearlos en X3d u otro
async function getResults(sqlQuery, sqlReplacements) {
  let resultados = await db.any(sqlQuery, sqlReplacements);//esperamos los resultados de la consulta con await
  //console.log(results);

  //plantilla de objeto geoJSON, la cual debe ser unica para cada peticion
  let geoJSONResult = {
    "type": "FeatureCollection",
    "totalFeatures": 0,  //este valor se debe actualizar
    "features": [],//aqui es donde se colocan los rasgos
    "crs": {
      "type": "name",
      "properties": {
        "name": "urn:ogc:def:crs:EPSG::4326"//habra que modificarlo conforme a las respuestas
      }
    }
  };

  //iteramos sobre el arreglo de respuestas o results, es decir, para cada resultado_i ejecutamos una pieza de codigo que crea un feature
  resultados.forEach(function (resultado_i) {
    //creamos una plantilla para cada feature
    //los properties son especificas de cada fila.
    //aunque hay manera de automatizar los properties que se agregan, eso queda fuera del alcance de la practica, sorry =(
    let feature = {
      "type": "Feature",
      "id": resultado_i.id,
      "geometry": JSON.parse(resultado_i.json),
      "geometry_name": "geom",
      "properties": {
        "id": resultado_i.id,  //<= muevanle aqui
        "cve_muni": resultado_i.cvemuni, //<= aqui,
        "nom_mun": resultado_i.nom_mun,//<= aqui
        "layer": resultado_i.layer//<= y  aqui
        //si faltan mas cosas, agregarlas
      }
    };
    //console.log(JSON.stringify(feature));//por si quisiera ver el contenido de cada iteracion
    //revisar https://www.w3schools.com/jsref/jsref_push.asp para mas informacion de push()
    geoJSONResult.features.push(feature);//agregamos el feature al arreglo numFeatures
  });

  //un poco de cortesia al programador
  console.log("Registros agregados: " + geoJSONResult.features.length);
  geoJSONResult.totalFeatures = geoJSONResult.features.length;//actualizando el numero de registros de GeoJSON
  return geoJSONResult;//devolviendo los resultados.


}//end getREsults





//codigo para el levantar el servidor HTTP
//el servidor debe contar con una ruta y una funcion que genera la respuesta
//las rutas se describen empleando las expresiones regulares de express : https://expressjs.com/en/guide/routing.html
//aunque para los fines didacticos, se emplean rutas estaticas

//ver el ejemplo basado en rest en
//https://github.com/lwsjs/local-web-server/wiki/How-to-prototype-a-REST-API

class X3DPostGIS {
  middleware() {
    const router = require('koa-route')
    return [

      // router.get('/', function (ctx) {
      //   ctx.response.type = 'html';
      //   //aqui devolvemos el manual de uso simple
      //   ctx.response.body = 'X3D Server   post getX3D   sql -> x3d'
      // }),
      ////////////////////////////////////////
      // router.get('/getX3D', getX3D),
      router.post('/getX3Dmock', getX3Dmock),
      router.post('/getX3D', getX3D),

      ////////////////////////
      router.get('/getPostgis',postgisQuery),
      router.post('/getPostgis', postgisQuery)
    ]
  }
}

module.exports = X3DPostGIS
