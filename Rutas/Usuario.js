// FICHERO DE CONFIGURACIÓN DE RUTAS DE "USUARIOS"

'use strict'                                                    //Significa que puede usar las nuevas instrucciones de los nuevos estandares de JavaScript

var express =  require('express');                              //Cargamos el módulo "express" para poder crear las rutas

var ControladorUsuario = require('../Controladores/Usuario');   //Cargamos el módulo controlador creado en la carpeta "controladores" en el archivo "usuario.js"

var api = express.Router();                                     //Usamos el router de "express" para tener acceso a los métodos GET, POST, PUT, DELETE

var midd_autor = require('../Middlewares/Autenticado');         //Cargamos el middleware que creamos en el archivo "Autenticado.js" dentro de la carpeta MIDDLEWARES

var multipart = require('connect-multiparty');                  //Librería que nos permite utilizar un middleware para subir archivos
var midd_Subir = multipart({ uploadDir: './Uploads/Usuarios'}); //"uploadDir"= Parámetro que indica el directorio a donde se van a subir archivos, 
                                                                //"./Uploads/Usuarios"= Destino de los archivos


//-- Ruta Personalizadas --
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//"/PARAM1": Segmento de URL (Nombre de la Ruta)
//"PARAM2":  Método del controlador que se está usando
//"midd_autor.ensureAuth" = Sólo algunas rutas lo tienen, indica que para ejecutarlas requerimos autenticación de Token del Usuario


//Métodos de Prueba
/* ---------------------------------------------------- */
api.get('/home',ControladorUsuario.home);
//Protegemos a esta ruta con autenticación basada en token
api.get('/prueba',midd_autor.ensureAuth,ControladorUsuario.pruebas);
/* ---------------------------------------------------- */

//Método para registar un Usuario a BDD, es un "POST", se guardará en BDD
api.post('/NuevoUsuario',ControladorUsuario.NuevoUsuario);

//Método para comprobar que un Usuario existe BDD, es un "POST", se va a consultar la BDD
api.post('/Login',ControladorUsuario.LoguearUsuario);

//Método para obtener los datos de un Usuario, es un "GET", se va a consultar la BDD
//Protegemos a esta ruta con autenticación basada en token
//"/:id" = A travez de la URL esperamos un valor de ID, es obligatorio, si quisieramso que fuese opcional escribiriamos: "/:id?"
api.get('/ObtenerUsuario/:id',midd_autor.ensureAuth,ControladorUsuario.ObtenerUsuario);

//Método para listar los Usuarios existentes, es un "GET", se va a consultar la BDD
//Protegemos a esta ruta con autenticación basada en token
//"/:page?" = A travez de la URL esperamos un valor de página, es decir, cual página queremos mostrar, es opcional
api.get('/ListarUsuarios/:page?',midd_autor.ensureAuth,ControladorUsuario.ListarUsuarios);

//Método para actualizar los datos de un Usuario, es un "PUT", se va a modificar la BDD
//Protegemos a esta ruta con autenticación basada en token
api.put('/ActualizarUsuario/:id',midd_autor.ensureAuth,ControladorUsuario.ActualizarUsuario);

//Método para actualizar los datos de un Usuario, es un "POST", se va a consultar la BDD
//"[md_auth.ensureAuth,midd_Subir]" = Usamos 2 middleware, el que generamos para autenticación y el que nos proporciona la libreria "connect-multiparty"
//Protegemos a esta ruta con autenticación basada en token
api.post('/SubirImagenUsuario/:id',[midd_autor.ensureAuth,midd_Subir],ControladorUsuario.SubirImagen);

//Método para mostrar la imagen/avatar de un Usuario, es un "GET", se va a Consultar la BDD
api.get('/VerImagenUsuario/:ArchivoImagen',ControladorUsuario.ObtenerArchImagen);

//Método que nos devuelve los contadores de usuarios que seguimos y nos siguen, es un "GET", se va a Consultar la BDD
//Protegemos a esta ruta con autenticación basada en token
api.get('/ContadoresUsuEstad/:id?',midd_autor.ensureAuth,ControladorUsuario.ObtenerContadores);
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


//Exportamos el objeto del API con toda la configuración de rutas
module.exports = api;