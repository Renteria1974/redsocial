//Creamos un Servidor WEB con "EXPRESS" dentro de "JS", esto va a ser el motor de la Aplicación WEB, se va a encargar de recibir peticiones HTTP,
//de crear controladores, de tener disponibles rutas, Etc... todo esto para poder construir el servidio RESTFULL de la mejor manera posible a nivel
//de BackEnd.
//Este fichero se importa en el archivo "index.js"

'use strict'                                        //Significa que puede usar las nuevas instrucciones de los nuevos estandares de JavaScript

var express =  require('express');                  //Cargamos el módulo "express", nos va a permitir trabajar con las rutas, protocolo HTTP, etc.

var bodyParser = require('body-parser');            //Cargamos el módulo "body-parser" que sirve para convertir los JSON  (de las peticiones API)
                                                    // que nos llegan a un objeto JavaScript usables y funcionales
var path = require('path');

var app = express();                                //Invocamos a la función "express", carga el framework de "express" directamente



//-- CARGAR RUTAS --
var Usuario_Rutas = require('./Rutas/Usuario');         //Cargamos el módulo de configuración de rutas que creamos en la carpeta de "rutas" en el archivo "Usuario.js"
var Follow_Rutas = require('./Rutas/Follow');           //Cargamos el módulo de configuración de rutas que creamos en la carpeta de "Rutas" en el archivo "Follow.js"
var Publicacion_Rutas = require('./Rutas/Publicacion'); //Cargamos el módulo de configuración de rutas que creamos en la carpeta de "Rutas" en el archivo "Publicacion.js"
var Mensaje_Rutas = require('./Rutas/Mensaje');         //Cargamos el módulo de configuración de rutas que creamos en la carpeta de "Rutas" en el archivo "Mensaje.js"



//-- MIDDLEWARE DE BODY-PARDER 
//Son funciones, métodos que se ejecutan en primer lugar cuando se ejecutan peticiones HTTP, antes de que llegue a un controlador) --
app.use(bodyParser.urlencoded({extended:false}))    //Creamos el middleware
app.use(bodyParser.json());                         //Lo que traiga el body lo convertimos a JSON para poder usarlo dentro de nuestro código



//-- CONFIGURAR CABECERAS Y CORS -- (Para cualquier proyecto aplican las siguientes instrucciones, son las mismas)
//Creamos el Middleware para el CORS, es el acceso cruzado entre dominios, se configuran una serie de
//cabeceras para permitir peticiones AJAX de un dominio a otro, desde nuestro cliente hasta nuestra API
//Así nos evitamos problemas a la hora de hacer peticiones AJAX desde JavaScript, un FrontEnd, Etc.
app.use((req,res,next) =>
{
    res.header('Access-Control-Allow-Origin','*');                              //Indica que cualquiera pueda acceder a estr origen
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With,Content-Type, Accept,Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS,PUT,DELETE');   //Métodos HTTP Permitidos
    res.header('Allow','GET,POST,OPTIONS,PUT,DELETE');                          //En la regla "allow" se pasan nuevamente los métodos anteriores

    next();
});



//-- RUTAS BASE
//Aquí cargamos la configuración de rutas) --
/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */
//"app.use"=        Nos permite hacer middleware, es decir, en cada petción que se haga el middleware siempre se va a ejecutar antes de llegar a la acción del controlador
//"/api"=           Prefijo, para que todas las URL de nuestra API sean precedidas por "/api",

app.use('/',express.static('client',{redirect:false}));

//"Usuario_Rutas"=  Ruta para los "Usuarios"
app.use('/api',Usuario_Rutas);

//"Follow_rutas"=  Ruta para los "Follows"
app.use('/api',Follow_Rutas);

//"Publicacion_rutas"=  Ruta para las "Publicaciones"
app.use('/api',Publicacion_Rutas);

//"Mensaje_rutas"=  Ruta para las "Mensajes"
app.use('/api',Mensaje_Rutas);

/* +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ */

app.get('*',function(req,res,next) {
    res.sendFile(path.resolve('client/index.html'));
})



//-- EXPORTAMOS EL MÓDULO
module.exports = app;