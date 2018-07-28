// ++ MODELO DE "USUARIO" ++
//Es una representación de una Entidad de la BDD

'use strict'                        //Significa que puede usar las nuevas instrucciones de los nuevos estandares de JavaScript

var mongoose = require('mongoose'); //Variable para cargar el módulo de Mongoose, nos va a servir para trabajar con la BDD dentro de nuestra API REST

var Esquema = mongoose.Schema;       //Cargamos los esquemas de mongoose

//Definimos el esquema de nuestra colección de Usuarios, es la estructura que a a terner el objeto
//Se le pasa como parámetro un JSON
var EsquemaUsuario = Esquema({
    nombre:     String,
    apellido:   String,
    nick:       String,
    email:      String,
    password:   String,
    rol:        String,
    imagen:     String
});

//-- Exportamos el Módulo --
//"mongoose.model":     Se genera el modelo
//"'Usuario'":          Nombre de la entidad, va a representar a un documento de la entidad de Usuarios
//"EsquemaUsuario":     Esquema que va a tener cada objeto que se crea con este modelo
module.exports = mongoose.model('Usuario',EsquemaUsuario);
