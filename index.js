//Es el fichero principal de la Aplicación, es el punto de partida para lanzar el Backend. Por aquí va a pasarcualquier petición
//Aquí se realiza la conexión a MongoDB y la creación de un servidor Web con Node

'use strict'                            //Significa que puede usar las nuevas instrucciones de los nuevos estandares de JavaScript

var mongoose = require('mongoose');     //Variable para cargar el módulo de Mongoose, nos va a servir para conectarnos a MongoDB para trabajar con la BDD dentro de nuestra API REST

var app = require('./app');             //Cargamos el servidor web que creamos en el archivo "app.js"

var port = 3800;                        //Indicamos el puerto que va a usar el Servidor, "process.env.port" se usa si tenemos una variable de entorno
                                        // configurada en el sistema, 3800 es el puerto que usamos en este caso

mongoose.Promise = global.Promise;      //Para conectaros a MongoDB tenemos que utilizar las "promesas"


//Nos conectamos a la BDD, usamos función de callback tipo flecha
mongoose.connect('mongodb://localhost:27017/Red_Social')
    //En caso de que se realice bien la conexión a BDD
    .then(() => {
        console.log('La Conexión a la BDD Red_Social se ha realizado Correctamente!!!');

        //Lanzar o ejecutar la conexión y crear el Servidor. Creamos un Servidor WEB con NodeJS que escuche peticiones
        //Usamos una función de callback que está vacía
        app.listen(port,()=> {
            //Al no haber error, mandamos el mensaje
            console.log('Servidor corriendo en http://localhost:3800');
        });
    })
    //En caso de haber algún error lo capturamos
    .catch(err => console.log(err));