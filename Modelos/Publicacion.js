// ++ MODELO DE "PUBLICACION" ++
//Es una representación de una Entidad de la BDD

'use strict'                        //Significa que puede usar las nuevas instrucciones de los nuevos estandares de JavaScript

var mongoose = require('mongoose'); //Variable para cargar el módulo de Mongoose, nos va a servir para trabajar con la BDD dentro de nuestra API REST

var Esquema = mongoose.Schema;       //Cargamos los esquemas de mongoose

//Definimos el esquema de nuestra colección de Publicaciones, es la estructura que a a terner el objeto
//Se le pasa como parámetro un JSON
var EsquemaPublicacion = Esquema({
    id_usuario:     {type: Esquema.ObjectId,ref:'Usuario'},
    texto:          String,
    archivo:        String,
    fecha_creacion: String
});

//-- Exportamos el Módulo --
//"mongoose.model":     Se genera el modelo
//"'Publicacion'":          Nombre de la entidad, va a representar a un documento de la entidad de Publicaciones
//"EsquemaPublicacion":     Esquema que va a tener cada objeto que se crea con este modelo
module.exports = mongoose.model('Publicacion',EsquemaPublicacion);