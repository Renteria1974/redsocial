// ++ MODELO DE "mensaje" ++
//Es una representación de una Entidad de la BDD

'use strict'                        //Significa que puede usar las nuevas instrucciones de los nuevos estandares de JavaScript

var mongoose = require('mongoose'); //Variable para cargar el módulo de Mongoose, nos va a servir para trabajar con la BDD dentro de nuestra API REST

var Esquema = mongoose.Schema;      //Cargamos los esquemas de mongoose

//Definimos el esquema de nuestra colección de Mensajes, es la estructura que a a terner el objeto
//Se le pasa como parámetro un JSON
var EsquemaMensaje = Esquema({
    id_usuario_emisor:      {type: Esquema.ObjectId,ref:'Usuario'},
    id_usuario_receptor:    {type: Esquema.ObjectId,ref:'Usuario'},
    texto:                  String,
    fecha_creacion:         String,
    visto:                  String
});

//-- Exportamos el Módulo --
//"mongoose.model":     Se genera el modelo
//"'Mensaje'":           Nombre de la entidad, va a representar a un documento de la entidad de Mensajes
//"EsquemaMensaje":      Esquema que va a tener cada objeto que se crea con este modelo
module.exports = mongoose.model('Mensaje',EsquemaMensaje);