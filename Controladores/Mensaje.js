// ++ CONTROLADOR DE "MENSAJES PRIVADOS"  ++
//Reciben las peticiones HTTP y de hacer la lógica y funcionalidad de cada Método

'use strict'                                                //Significa que puede usar las nuevas instrucciones de los nuevos estandares de JavaScript

//-- MÓDULOS --
var Moment = require('moment');                             //Nos va a permitir generar un timestamp, generar fechas, trabajar con ellas
var MongoosePaginacion = require('mongoose-pagination');    //Cargamos el módulo "mongoose-pagination" para poder realizar paginaciones de los listados

//-- MODELOS --
var Usuario = require('../Modelos/Usuario');                //Cargar el modelo de Usuarios creado en el archivo "Usuario.js" dentro del a carpeta "Modelos"
var Follow = require('../Modelos/Follow');                  //Cargar el modelo de Follows creado en el archivo "Follow.js" dentro del a carpeta "Modelos"
var Mensaje = require('../Modelos/Mensaje');                //Cargar el modelo de Usuarios creado en el archivo "Mensaje.js" dentro del a carpeta "Modelos"



//-- ACCIONES --
//Métodos de prueba
/* ----------------------------------------- */
function probandoMensaje(pet,res)
{
    res.status(200).send({Mensaje: 'Accion de Pruebas con el Controlador de Mensajes Privados'});
}
/* ----------------------------------------- */

//Metodo para Agregar un Nuevo Mensaje Privado a la BDD
//"pet": Petición
//"res": Respuesta
function NuevoMensaje(pet,res)
{
    var mensaje = new Mensaje();    //Creamos una instancia (Objeto) de Mensaje
    var params  = pet.body;         //Recoger los parámetros que nos llegan por la petición, que nos llegan por POST


    //Comprobar si llegan todos los datos para guardar el Nuevo Mensaje Privado
    if(!params.texto || !params.id_usuario_receptor) return res.status(200).send({Mensaje: 'Envía los Datos Necesarios.'})

    //Asignar valores al Objeto "mensaje"
    mensaje.id_usuario_emisor       = pet.UsuarioLogueado.sub;  //Es el ID del usuario logueado
    mensaje.id_usuario_receptor     = params.id_usuario_receptor;
    mensaje.texto                   = params.texto;
    mensaje.fecha_creacion          = Moment().unix();
    mensaje.visto                   = 'false';
    
    //".save" = Método para guardar el documento en BDD, tiene una función de callback que regresa un error(err) o un Mensaje guardado(mensajeGuardado)
    mensaje.save((err,mensajeGuardado) =>
    {
        //Se genera un error
        if(err) return res.status(500).send({Mensaje: 'Error al guardar el Mensaje Privado.'});

        //El objeto está vacio
        if(!mensajeGuardado) return res.status(404).send({Mensaje: 'El Mensaje Privado no ha sido Guardado.'});

        //Todo OK, regresamos el Objeto "mensaje"
        return res.status(200).send({mensaje: mensajeGuardado});
    });
}


//Metodo para listar Mensajes Privados Recibidos por el Usuario Logueado
//"pet": Petición
//"res": Respuesta
function Listado_Mensajes_Recib(pet,res)
{
    var IdUsuario = pet.UsuarioLogueado.sub;    //Obtenemos el ID del usuario logueado

    var pagina = 1;                             //Contador de página , por default le asignamos "1"

    var ElemsPorPag = 4;                        //Cantidad de elementos que se van a mostrar por página

    //Si en la URL tecleamos el número de página entonces actualizamos nuestra variable
    if(pet.params.page)
    {
        pagina = pet.params.page;
    }


    //Obtenemos todos los usuarios que sigue el Usuario "IdUsuario"
    //"Follow.find({id_usuario_receptor: IdUsuario})"  = Obtenemos todos los Mensajes Preovados en donde el usuario Receptor sea el Usuario Logueado
    //.populate(id_usuario_emisor}) = Con esto lo que logramos es que en lugar de solo mostrar el ID del usuario emisor es que se obtienen
                                    //todos sus datos
    //".sort('-fecha_creacion')"    = El listado se ordena por orden de fecha de Creación en forma descendente (del mas nuevo al mas viejo)
    //".paginate"                   = Método usado para paginar los resultados, sus parámetros son la página actual(pagina), el # de elementos por página(elemsporpag) y
                                    //una función de callback que puede regresar un error(err), los mensajes que va a devolver la query a la BDD y un total de registros
                                    //que hay en la colección de la BDD
    //"'nombre apellido _id nick imagen'" = Indico que sólo quiero mostrar esos campos del Usuario, no los deseo todos
    Mensaje.find({id_usuario_receptor: IdUsuario}).populate('id_usuario_emisor','nombre apellido _id nick imagen').sort('-fecha_creacion').paginate(pagina,ElemsPorPag,(err,Mensajes,total) =>
    {
        //Tenemos un Error
        if(err) return res.status(500).send({Mensaje:'Error en la Petición'});

        //El listado de Follows no nos llega, el objeto está vacío
        if(!Mensajes) return res.status(404).send({Mensaje: 'No hay Mensajes Privados que mostrar.'});


        //Todo OK, regresamos el listado de follows
        //"Math.ceil(total/ElemsPorPag)" = Redondear la número de páginas
        return res.status(200).send({
            Total: total,
            Páginas: Math.ceil(total/ElemsPorPag),
            Mensajes
        });
    });
}


//Metodo para listar Mensajes Privados que el Usuario Logueado ha Enviado
//"pet": Petición
//"res": Respuesta
function Listado_Mensajes_Enviad(pet,res)
{
    var IdUsuario = pet.UsuarioLogueado.sub;    //Obtenemos el ID del usuario logueado

    var pagina = 1;                             //Contador de página , por default le asignamos "1"

    var ElemsPorPag = 4;                        //Cantidad de elementos que se van a mostrar por página

    //Si en la URL tecleamos el número de página entonces actualizamos nuestra variable
    if(pet.params.page)
    {
        pagina = pet.params.page;
    }


    //Obtenemos todos los usuarios que sigue el Usuario "IdUsuario"
    //"Follow.find({id_usuario_receptor: IdUsuario})"  = Obtenemos todos los Mensajes Preovados en donde el usuario Receptor sea el Usuario Logueado
    //.populate('id_usuario_emisor id_usuario_receptor'}) = Con esto lo que logramos es que en lugar de solo mostrar el ID del usuario emisor y receptor es que se obtienen
                                    //todos sus datos
    //".sort('-fecha_creacion')"    = El listado se ordena por orden de fecha de Creación en forma descendente (del mas nuevo al mas viejo)
    //".paginate"                   = Método usado para paginar los resultados, sus parámetros son la página actual(pagina), el # de elementos por página(elemsporpag) y
                                    //una función de callback que puede regresar un error(err), los mensajes que va a devolver la query a la BDD y un total de registros
                                    //que hay en la colección de la BDD
    //"'nombre apellido _id nick imagen'" = Indico que sólo quiero mostrar esos campos del Usuario, no los deseo todos    
    Mensaje.find({id_usuario_emisor: IdUsuario}).sort('-fecha_creacion').populate('id_usuario_emisor id_usuario_receptor','nombre apellido _id nick imagen').paginate(pagina,ElemsPorPag,(err,Mensajes,total) =>
    {
        //Tenemos un Error
        if(err) return res.status(500).send({Mensaje:'Error en la Petición'});

        //El listado de Follows no nos llega, el objeto está vacío
        if(!Mensajes) return res.status(404).send({Mensaje: 'No hay Mensajes Privados que mostrar.'});


        //Todo OK, regresamos el listado de follows
        //"Math.ceil(total/ElemsPorPag)" = Redondear la número de páginas
        return res.status(200).send({
            Total: total,
            Páginas: Math.ceil(total/ElemsPorPag),
            Mensajes
        });
    });
}


//Metodo para Obtener el total de Mensajes Privados Recibidos por el Usuario Logueado y que no han sido Leídos
//"pet": Petición
//"res": Respuesta
function Contador_Mensajes_Recib_NoLeidos(pet,res)
{
    var IdUsuario = pet.UsuarioLogueado.sub;    //Obtenemos el ID del usuario logueado


    //Obtenemos todos los usuarios que sigue el Usuario "IdUsuario"
    //"Follow.count({id_usuario_receptor: IdUsuario,visto:'false'})"  = Obtenemos el número de Mensajes Privados en donde el usuario Receptor sea el Usuario Logueado
                    //y no han sido leídos
    //".exec((err,mensajes)'" = Ejecutamos la query con 2 parámetrosde retorno: un posible error(err) y los objetos de los mensajes no leídos(mensajes)
    Mensaje.count({id_usuario_receptor: IdUsuario,visto:'false'}).exec((err,contador) =>
    {
        //Tenemos un Error
        if(err) return res.status(500).send({Mensaje:'Error en la Petición'});


        //Todo OK, regresamos el listado de follows
        //"Math.ceil(total/ElemsPorPag)" = Redondear la número de páginas
        return res.status(200).send({
            No_leídos: contador
        });
    });
}


//Metodo para Marcar un mensaje (recibido por el Usuario Logueado) como leído
//"pet": Petición
//"res": Respuesta
function Marcar_Mensajes_como_Leidos(pet,res)
{
    var IdUsuario = pet.UsuarioLogueado.sub;    //Obtenemos el ID del usuario logueado


    //Obtenemos todos los usuarios que sigue el Usuario "IdUsuario"
    //"Follow.update({id_usuario_receptor: IdUsuario,visto:'false'})"  = Obtenemos el número de Mensajes Privados en donde el usuario Receptor sea el Usuario Logueado
                    //y no han sido leídos
    //'{visto:'true'} = Marcamos el mensaje como leido
    //"{"multi":true}" = Se actualizan todos los documentos que se detectaron wur no habían sido leídos
    //"(err,mensActualiz)'" = Ejecutamos la query con 2 parámetros de retorno: un posible error(err) y los objetos de los mensajes  marcados como leídos(mensactualiz)
    Mensaje.update({id_usuario_receptor: IdUsuario,visto:'false'},{visto:'true'},{"multi":true},(err,mensActualiz) =>
    {
        //Tenemos un Error
        if(err) return res.status(500).send({Mensaje:'Error en la Petición'});

        //Todo OK, regresamos el listado de follows
        //"Math.ceil(total/ElemsPorPag)" = Redondear la número de páginas
        return res.status(200).send({
            Mensajes: mensActualiz
        });
    });
}



//-- Exportamos los Métodos --
module.exports =
{
    probandoMensaje,
    NuevoMensaje,
    Listado_Mensajes_Recib,
    Listado_Mensajes_Enviad,
    Contador_Mensajes_Recib_NoLeidos,
    Marcar_Mensajes_como_Leidos
};