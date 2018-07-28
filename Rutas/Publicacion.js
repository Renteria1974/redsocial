// FICHERO DE CONFIGURACIÓN DE RUTAS DE "PUBLICACIONES"

'use strict'                                                            //Significa que puede usar las nuevas instrucciones de los nuevos estandares de JavaScript

var Express =  require('express');                                      //Cargamos el módulo "express" para poder crear las rutas

var API = Express.Router();                                             //Usamos el router de "express" para tener acceso a los métodos GET, POST, PUT, DELETE

var ControladorPublicacion = require('../Controladores/Publicacion');   //Cargamos el módulo controlador creado en la carpeta "controladores" en el archivo "Publicacion.js"

var Midd_Autentic = require('../Middlewares/Autenticado');              //Cargamos el middleware que creamos en el archivo "Autenticado.js" dentro de la carpeta MIDDLEWARES

var Multipart = require('connect-multiparty');                          //Librería que nos permite utilizar un middleware para subir archivos
var Midd_Subir = Multipart({ uploadDir: './Uploads/Publicaciones'});    //"uploadDir"= Parámetro que indica el directorio a donde se van a subir archivos, 
                                                                        //"./Uploads/Usuarios"= Destino de los archivos


//-- Ruta Personalizadas --
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//"/PARAM1": Segmento de URL (Nombre de la Ruta)
//"PARAM2":  Método del controlador que se está usando
//"Midd_Autentic.ensureAuth" = Sólo algunas rutas lo tienen, indica que para ejecutarlas requerimos autenticación de Token del Usuario


//Métodos de Prueba
/* ---------------------------------------------------- */
//Protegemos a esta ruta con autenticación basada en token
API.get('/probando-pub',Midd_Autentic.ensureAuth,ControladorPublicacion.probando);
/* ---------------------------------------------------- */

//Método para Guardar una Nueva Publicacion, es un "POST", se va a Guardar en la BDD
//Protegemos a esta ruta con autenticación basada en token
API.post('/NuevaPublicacion',Midd_Autentic.ensureAuth,ControladorPublicacion.NuevaPublicacion);

//Método para Listar las publicaciones de los usuarios que sigue el usuario Logueado, es un "GET", se va a Consultar la BDD
//Protegemos a esta ruta con autenticación basada en token
//"/:page?" = A travez de la URL esperamos un valor de página, es decir, cual página queremos mostrar, es opcional
API.get('/ListarPublicUsuSeguidos/:page?',Midd_Autentic.ensureAuth,ControladorPublicacion.ListarPublicUsuSeguidos);

//Método para Listar las publicaciones de los usuarios de un solo usuario, es un "GET", se va a Consultar la BDD
//Protegemos a esta ruta con autenticación basada en token
//"/:page?" = A travez de la URL esperamos un valor de página, es decir, cual página queremos mostrar, es opcional
API.get('/ListarPublicUnUsuario/:user/:page?',Midd_Autentic.ensureAuth,ControladorPublicacion.ListarPublicUnUsuario);

//Método para obtener los datos de una Publicacion, es un "GET", se va a consultar la BDD
//Protegemos a esta ruta con autenticación basada en token
API.get('/ObtenerPublicacion/:id',Midd_Autentic.ensureAuth,ControladorPublicacion.ObtenerPublicacion);

//Método para Eliminar el Documento de una Publicacion, es un "DELETE", se va a consultar la BDD
//Protegemos a esta ruta con autenticación basada en token
API.delete('/EliminarPublicacion/:id',Midd_Autentic.ensureAuth,ControladorPublicacion.EliminarPublicacion);

//Método para actualizar agregar una imagen a la Publicacion, es un "POST", se va a consultar la BDD
//"[Midd_Autentic.ensureAuth,Midd_Subir]" = Usamos 2 middleware, el que generamos para autenticación y el que nos proporciona la libreria "connect-multiparty"
//Protegemos a esta ruta con autenticación basada en token
API.post('/AgregaArchPublic/:id',[Midd_Autentic.ensureAuth,Midd_Subir],ControladorPublicacion.AgregaArchPublic);

//Método para mostrar el archivo de una Publicacion, es un "GET", se va a Consultar la BDD
API.get('/ObtenerArchivoPublic/:ArchivoImagen',ControladorPublicacion.ObtenerArchivoPublic);


//Exportamos el objeto del API con toda la configuración de rutas
module.exports = API;