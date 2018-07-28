// FICHERO DE CONFIGURACIÓN DE RUTAS DE "FOLLOWS"

'use strict'                                                    //Significa que puede usar las nuevas instrucciones de los nuevos estandares de JavaScript

var Express =  require('express');                              //Cargamos el módulo "express" para poder crear las rutas

var API = Express.Router();                                     //Usamos el router de "Express" para tener acceso a los métodos GET, POST, PUT, DELETE

var ControladorFollow = require('../Controladores/Follow');     //Cargamos el módulo controlador creado en la carpeta "controladores" en el archivo "Follow.js"

var midd_autor = require('../Middlewares/Autenticado');         //Cargamos el middleware que creamos en el archivo "Autenticado.js" dentro de la carpeta MIDDLEWARES


//-- Ruta Personalizadas --
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//"/PARAM1": Segmento de URL (Nombre de la Ruta)
//"PARAM2":  Método del controlador que se está usando
//"midd_autor.ensureAuth" = Sólo algunas rutas lo tienen, indica que para ejecutarlas requerimos autenticación de Token del Usuario


//Método para Guardar un Follow en BDD, es un "POST", se guardará en BDD
//Protegemos a esta ruta con autenticación basada en token
API.post('/GuardarFollow',midd_autor.ensureAuth,ControladorFollow.Grabar_Follow);

//Método para Eliminar un Follow en BDD, es un "DELETE", se guardará en BDD
//Protegemos a esta ruta con autenticación basada en token
API.delete('/EliminarFollow/:id',midd_autor.ensureAuth,ControladorFollow.Eliminar_Follow);

//Método para listar los Usuarios que un usuario sigue, es un "GET", se va a consultar la BDD
//Protegemos a esta ruta con autenticación basada en token
//"/:id?" = A travez de la URL esperamos el ID del usuario del que deseamos sacar la lista, es opcional
//"/:pagina?" = A travez de la URL esperamos un valor de página, es decir, cual página queremos mostrar, es opcional
API.get('/ListarSeguidos/:id?/:page?',midd_autor.ensureAuth,ControladorFollow.Listado_Usuarios_Seguidos);

//Método para listar los Usuarios que siguen a un Usuario determinado, es un "GET", se va a consultar la BDD
//Protegemos a esta ruta con autenticación basada en token
//"/:id?" = A travez de la URL esperamos el ID del usuario del que deseamos sacar la lista, es opcional
//"/:pagina?" = A travez de la URL esperamos un valor de página, es decir, cual página queremos mostrar, es opcional
API.get('/ListarUsuMeSiguen/:id?/:page?',midd_autor.ensureAuth,ControladorFollow.Listado_Usuarios_me_Siguen);

//Método para listar los Usuarios que un usuario sigue, es un "GET", se va a consultar la BDD
//Protegemos a esta ruta con autenticación basada en token
//"/:id?" = A travez de la URL esperamos el ID del usuario del que deseamos sacar la lista, es opcional
//"/:pagina?" = A travez de la URL esperamos un valor de página, es decir, cual página queremos mostrar, es opcional
API.get('/ListarSeguidossinPag/:id_usuario_seguido?',midd_autor.ensureAuth,ControladorFollow.Listado_Usuarios_Seguidos_sin_Paginar);
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



//Exportamos el objeto del API con toda la configuración de rutas
module.exports = API;