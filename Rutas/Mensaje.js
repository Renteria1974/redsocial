// FICHERO DE CONFIGURACIÓN DE RUTAS DE "MENSAJES PRIVADOS"

'use strict'                                                    //Significa que puede usar las nuevas instrucciones de los nuevos estandares de JavaScript

var Express =  require('express');                              //Cargamos el módulo "express" para poder crear las rutas

var ControladorMensaje = require('../Controladores/Mensaje');   //Cargamos el módulo controlador creado en la carpeta "controladores" en el archivo "Mensaje.js"

var API = Express.Router();                                     //Usamos el router de "express" para tener acceso a los métodos GET, POST, PUT, DELETE

var Midd_Autentic = require('../Middlewares/Autenticado');      //Cargamos el middleware que creamos en el archivo "Autenticado.js" dentro de la carpeta MIDDLEWARES




//-- Ruta Personalizadas --
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//"/PARAM1": Segmento de URL (Nombre de la Ruta)
//"PARAM2":  Método del controlador que se está usando
//"Midd_Autentic.ensureAuth" = Sólo algunas rutas lo tienen, indica que para ejecutarlas requerimos autenticación de Token del Usuario


//Métodos de Prueba
/* ---------------------------------------------------- */
//Protegemos a esta ruta con autenticación basada en token
API.get('/probando-msj',Midd_Autentic.ensureAuth,ControladorMensaje.probandoMensaje);
/* ---------------------------------------------------- */

//Método para Guardar un Nuevo Mensaje Privado, es un "POST", se va a Guardar en la BDD
//Protegemos a esta ruta con autenticación basada en token
API.post('/NuevoMensajePriv',Midd_Autentic.ensureAuth,ControladorMensaje.NuevoMensaje);

//Método para listar los mensajes Provados recibidos por el Usuario Logueado, es un "GET", se va a consultar la BDD
//Protegemos a esta ruta con autenticación basada en token
//"/:page?" = A travez de la URL esperamos un valor de página, es decir, cual página queremos mostrar, es opcional
API.get('/ListarMensajRecib/:page?',Midd_Autentic.ensureAuth,ControladorMensaje.Listado_Mensajes_Recib);

//Método para listar los mensajes Privados que ha enviado el Usuario Logueado, es un "GET", se va a consultar la BDD
//Protegemos a esta ruta con autenticación basada en token
//"/:page?" = A travez de la URL esperamos un valor de página, es decir, cual página queremos mostrar, es opcional
API.get('/ListarMensajEnviad/:page?',Midd_Autentic.ensureAuth,ControladorMensaje.Listado_Mensajes_Enviad);

//Método para Obtener la cantidad de Mensajes recibidos y no leídos por el Usuario Logueado, es un "GET", se va a consultar la BDD
//Protegemos a esta ruta con autenticación basada en token
API.get('/ContadorMensRecibNoLeid',Midd_Autentic.ensureAuth,ControladorMensaje.Contador_Mensajes_Recib_NoLeidos);

//Método para Marcar como leídos los mensajes recibidos (y no leídos) del Usuario Logueado, es un "GET", 
//Protegemos a esta ruta con autenticación basada en token
API.get('/MarcarMenscomoLeidos',Midd_Autentic.ensureAuth,ControladorMensaje.Marcar_Mensajes_como_Leidos);



//Exportamos el objeto del API con toda la configuración de rutas
module.exports = API;
