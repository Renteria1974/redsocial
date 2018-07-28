// ++ CONTROLADOR DE "USUARIOS"  ++
//Reciben las peticiones HTTP y de hacer la lógica y funcionalidad de cada Método

'use strict'                                                //Significa que puede usar las nuevas instrucciones de los nuevos estandares de JavaScript

//-- MÓDULOS --
//var Ruta = require('path');                                 //Con esta librería podemos acceder directamente a las rutas de nuestro sistema de archivos
//var Sist_Archivos = require('fs');                          //"fs"=Librería File System de Node la cual nos permite trabajar con el sistema de archivos de NodeJS
var MongoosePaginacion = require('mongoose-pagination');    //Cargamos el módulo "mongoose-pagination" para poder realizar paginaciones de los listados

//-- MODELOS --
var Usuario = require('../Modelos/Usuario');                //Cargar el modelo de Usuarios creaod en el archivo "usuario.js" dentro del a carpeta "Modelos"
var Follow = require('../Modelos/Follow');                  //Cargar el modelo de Follows creaod en el archivo "Follow.js" dentro del a carpeta "Modelos"



//-- ACCIONES --
//Metodo para Guardar el seguimiento de un Usuario a otro
//"pet": Petición
//"res": Respuesta
function Grabar_Follow(pet,res)
{
    var Siguiendo = new Follow();   //Creamos una instancia (Objeto) de Follow
    var Params  = pet.body;         //Recoger los parámetros que nos llegan por la petición, que nos llegan por POST

    //Le asignamos el valor a cada una de las propiedades del objeto "Siguiendo"
    //"pet.usuario.sub" = Contiene el ID del usuario que está logueado;
    Siguiendo.id_usuario_que_sigue  = pet.UsuarioLogueado.sub;     //Usuario que está siguiendo
    Siguiendo.id_usuario_seguido    = Params.id_usuario_seguido;   //Usuario seguido

    //Nos aseguramos que se especificó el Usuario a seguir, del usuario que sigue no nos preocupamos porque
    //es quien autoriza la operación, ya se validó su existencia
    if(Siguiendo.id_usuario_seguido)
    {
        //Nos aseguramos que no exista un documento que tenga estos 2 ID
        Follow.find({'id_usuario_que_sigue': Siguiendo.id_usuario_que_sigue, 'id_usuario_seguido': Siguiendo.id_usuario_seguido}, (err, FollowExiste) =>
        {
            //Se localiza un documento, hay que abortar la operación
            if(FollowExiste.length > 0) return res.status(404).send({Mensaje: 'Error en la Peticion, ya existe el Follow que intenta Registrar.'});

            //Guardamos en BDD el Nuevo documento de Follow
            //"(err,FollowGuardado)" = Función de callback que puede recibir un error(err) o un Objeto guardado(followGuardado)
            Siguiendo.save((err,FollowGuardado) =>
            {
                //Hubo un error
                if(err) return res.status(500).send({Mensaje: 'Error al Guardar el Seguimiento.'});

                //En caso de que el Objeto llegue vacío
                if(!FollowGuardado) return res.status(404).send({Mensaje: 'El Seguimiento no se ha Guardado.'});

                //Todo OK
                return res.status(200).send({Mensaje: FollowGuardado});
            });
        });
    }
    else
    {
        res.status(404).send({Mensaje: 'Especifique el Usuario al que desea Seguir.'});
    }
}


//Metodo para Eliminar el seguimiento que hace un Usuario a otro
//"pet": Petición
//"res": Respuesta
function Eliminar_Follow(pet,res)
{
    var IdUsuario = pet.UsuarioLogueado.sub;    //Obtenemos el ID del usuario logueado
    var IdSiguiendo = pet.params.id;            //ID del usuario al que se va a dejar de seguir


    //Buscamos los documentos cuyo campo "id_usuario_que_sigue" tenga el mismo valor que "IdUsuario"
    //y que el campo "id_usuario_seguido" tenga el mismo valor que la variable "IdSiguiendo"
    //".remove" = Método para eliminar el documento que tiene una función de callback que puede regresar un error(err)
    Follow.find({'id_usuario_que_sigue': IdUsuario, 'id_usuario_seguido': IdSiguiendo}).remove(err =>
        {
            //Se presenta un error
            if(err) return res.status(500).send({Mensaje: 'No se pudo eliminar el Seguimiento al Usuario.'});

            //Todo OK
            return res.status(200).send({Mensaje: 'El Seguimiento al Usuario ha sido Eliminado.'});
        });
}


//Metodo para listar los usuarios que un usuario sigue
//"pet": Petición
//"res": Respuesta
function Listado_Usuarios_Seguidos(pet,res)
{
    var pagina = 1;                             //Contador de página , por default le asignamos "1"

    var ElemsPorPag = 4;                        //Cantidad de elementos que se van a mostrar por página

    var IdUsuario = pet.UsuarioLogueado.sub;    //Obtenemos el ID del usuario logueado

    //Si en la URL se tecleó el ID del usuario y el número de página entonces tomamos el ID de ahí,
    //caso contrario se deja el ID del Usuario logueado
    if(pet.params.id && pet.params.page)
    {
        IdUsuario = pet.params.id;
    }

    //Si en la URL tecleamos el número de página entonces actualizamos nuestra variable
    if(pet.params.page)
    {
        pagina = pet.params.page;
    }
    //De lo contrario la variable toma el valor del parámetro ID de la URL
    else
    {
        pagina= pet.params.id;
    }

    //Obtenemos todos los usuarios que sigue el Usuario "IdUsuario"
    //"Follow.find({id_usuario_que_sigue: IdUsuario})"  = Obtenemos todos los Follows en donde el "id_usuario_que_sigue" sea el "IdUsuario"
    //.populate({path: 'id_usuario_seguido'}) = Con esto lo que logramso es que en lugar de solo mostrar el ID delusuario al que se sigue
                                                //se obtienetoda la información (nombre, apellidi, nick) de dicho usuario
    //".paginate"       = Método usado para paginar los resultados, sus parámetros son la página actual(pagina), el # de elementos por página(elemsporpag) y
                        //una función de callback que puede regresar un error(err), los usuarios que va a devolver la query a la BDD y un total de registros
                        //que hay en la colección de la BDD
    Follow.find({id_usuario_que_sigue: IdUsuario}).populate({path: 'id_usuario_seguido'}).paginate(pagina,ElemsPorPag,(err,follows,total) =>
    {
        //Tenemos un Error
        if(err) return res.status(500).send({Mensaje:'Error en la Petición'});

        //El listado de Follows no nos llega, el objeto está vacío
        if(!follows) return res.status(404).send({Mensaje: 'El Usuario no sigue a nadie.'});

        //Método que nos regresa a quien sigue el usuario Logueado y quienes lo siguen a él
        //Con esta función ASINCRONA,devuelve una promesa
        //".then()" = Método con una función de callback que regresa un valor(valor)
        SiguiendoseTodos(pet.UsuarioLogueado.sub).then((valor) =>
        {    
            //Todo OK, regresamos el listado de follows
            //"Math.ceil(total/ElemsPorPag)" = Redondear la número de páginas
            return res.status(200).send({
                total: total,
                pages: Math.ceil(total/ElemsPorPag),
                follows,
                Usuarios_que_sigo: valor.siguiendo_a,
                Usuarios_me_siguen: valor.seguido
            });
        });    
    });
}


//Método que nos regresa a quien sigue el usuario Logueado y quienes lo siguen a él
//"async": ESTA FUNCIÓN LA HACEMOS "ASINCRONA", así la podemos ejecutar en cualquier parte de otros métodos. Y las consultas que hay dentro
            //de ella que sean SINCRONAS, es decir, que se espere a conseguir el resultado de una ejecución para continuar con lo siguiente
//"usuario_logueado": Usuario especificado en la URL
async function SiguiendoseTodos(usuario_logueado)
{
    //".select()"   = Sacamos sólo los datos que nos interesa obtener
    //".exec()"     = Executamos la query la cual tiene una función de callback que nos regresa un error(err) o los documentos(follows)

    try
    {
        //Obtenemos todos los documentos de la collección Follows en donde el "id_usuario_que_sigue" sea el usuario Logueado
        var siguiendo_a =
            await Follow.find({"id_usuario_que_sigue": usuario_logueado}).select({'_id':0,'_v':0,'id_usuario_que_sigue':0}).exec()
            .then((follows) =>
            {
                return follows;
            })
            .catch((err)=>{
                return handleError(err);
            });
        //Arreglo
        var siguiendo_a_limpios = [];
        //Se recorren los documentos "seguidos" que se obtuvieron en la consulta
        //"seguido" = Objeto que se crea por cada documento de "seguidos"
        siguiendo_a.forEach((seguido)=> 
        {
            //Agregamos un documento a nuestro arrreglo
            siguiendo_a_limpios.push(seguido.id_usuario_seguido);
        });


        //Obtenemos todos los documentos de la collección Follows en donde el "id_usuario_seguido" sea el usuario Logueado
        var es_seguido =
            await Follow.find({"id_usuario_seguido": usuario_logueado}).select({'_id':0,'_v':0,'id_usuario_seguido':0}).exec()
            .then((follows) =>
            {
                return follows;
            })
            .catch((err)=>{
                return handleError(err);
            });
        //Arreglo
        var es_seguido_limpios = [];
        //Se recorren los documentos "seguidos" que se obtuvieron en la consulta
        //"seguido" = Objeto que se crea por cada documento de "seguidos"
        es_seguido.forEach((seguido)=>
        {
            //Agregamos un documento a nuestro arrreglo
            es_seguido_limpios.push(seguido.id_usuario_que_sigue);
        });


        return {
            siguiendo_a:siguiendo_a_limpios,
            seguido:es_seguido_limpios
        }
    }
    catch(e)
    {
        return handleError(err);
    }
}


//Método para listar los usuarios que siguen a un Usuario determinado
//"pet": Petición
//"res": Respuesta
function Listado_Usuarios_me_Siguen(pet,res)
{
    var pagina = 1;                             //Contador de página , por default le asignamos "1"

    var ElemsPorPag = 4;                        //Cantidad de elementos que se van a mostrar por página

    var IdUsuario = pet.UsuarioLogueado.sub;    //Obtenemos el ID del usuario logueado

    //Si en la URL se tecleó el ID del usuario y el número de página entonces tomamos el ID de ahí,
    //caso contrario se deja el ID del Usuario logueado
    if(pet.params.id && pet.params.page)
    {
        IdUsuario = pet.params.id;
    }

    //Si en la URL tecleamos el número de página entonces actualizamos nuestra variable
    if(pet.params.page)
    {
        pagina = pet.params.page;
    }
    //De lo contrario la variable toma el valor del parámetro ID de la URL
    else
    {
        pagina= pet.params.id;
    }

    //Obtenemos todos los usuarios que sigue el Usuario "IdUsuario"
    //"Follow.find({id_usuario_seguido: IdUsuario})"  = Obtenemos todos los Follows en donde el "id_usuario_seguido" sea el "IdUsuario"
    //.populate('id_usuario_que_sigue') = Con esto lo que logramos es que en lugar de solo mostrar el ID del usuario que sigue
                                                //se obtiene toda la información (nombre, apellidi, nick) de dicho usuario
    //".paginate"       = Método usado para paginar los resultados, sus parámetros son la página actual(pagina), el # de elementos por página(elemsporpag) y
                        //una función de callback que puede regresar un error(err), los usuarios que va a devolver la query a la BDD y un total de registros
                        //que hay en la colección de la BDD
    Follow.find({id_usuario_seguido: IdUsuario}).populate('id_usuario_que_sigue').paginate(pagina,ElemsPorPag,(err,follows,total) =>
    {
        //Tenemos un Error
        if(err) return res.status(500).send({Mensaje:'Error en la Petición'});

        //El listado de Follows no nos llega, el objeto está vacío
        if(!follows) return res.status(404).send({Mensaje: 'No te sigue ningún Usuario.'});

        //Método que nos regresa a quien sigue el usuario Logueado y quienes lo siguen a él
        //Con esta función ASINCRONA,devuelve una promesa
        //".then()" = Método con una función de callback que regresa un valor(valor)
        SiguiendoseTodos(IdUsuario).then((valor) =>
        {    
            //Todo OK, regresamos el listado de follows
            //"Math.ceil(total/ElemsPorPag)" = Redondear la número de páginas
            return res.status(200).send({
                total: total,
                pages: Math.ceil(total/ElemsPorPag),
                follows,
                Usuarios_que_sigo: valor.siguiendo_a,
                Usuarios_me_siguen: valor.seguido,
            });
        });  
    });
}


//Metodo para listar los usuarios que un usuario sigue
//"pet": Petición
//"res": Respuesta
function Listado_Usuarios_Seguidos_sin_Paginar(pet,res)
{
    var IdUsuario = pet.UsuarioLogueado.sub;    //Obtenemos el ID del usuario logueado
    
    //Buscamos a todos los usuarios que el usuario logueado está siguiendo
    var find = Follow.find({id_usuario_que_sigue: IdUsuario});

    //Si se recibe por la URL el valor del ID del Usuario que es seguido
    //entonces buscamos a todos los usuarios que siguen al usuario logueado
    if(pet.params.id_usuario_seguido)
    {
        find = Follow.find({id_usuario_seguido: IdUsuario});
    }

    //Obtenemos todos los usuarios que sigue el Usuario "IdUsuario"
    //find.populate(id_usuario_que_sigue id_usuario_seguido) = Con esto lo que logramos es que en lugar de solo mostrar el ID del usuario al que se sigue
                                                // y del seguido se obtiene toda la información (nombre, apellidi, nick) de dichos usuarios
    find.populate('id_usuario_que_sigue id_usuario_seguido').exec((err,follows) =>
    {
        //Tenemos un Error
        if(err) return res.status(500).send({Mensaje:'Error en la Petición'});

        //El listado de Follows no nos llega, el objeto está vacío
        if(!follows) return res.status(404).send({Mensaje: 'El Usuario no sigue a nadie.'});

        //Todo OK, regresamos el listado de follows        
        return res.status(200).send({follows});
    });
}



//-- Exportamos los Métodos --
module.exports =
{
    Grabar_Follow,
    Eliminar_Follow,
    Listado_Usuarios_Seguidos,
    Listado_Usuarios_me_Siguen,
    Listado_Usuarios_Seguidos_sin_Paginar
}