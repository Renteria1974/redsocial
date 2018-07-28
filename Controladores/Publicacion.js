// ++ CONTROLADOR DE "PUBLICACIONES"  ++
//Reciben las peticiones HTTP y de hacer la lógica y funcionalidad de cada Método

'use strict'                                                //Significa que puede usar las nuevas instrucciones de los nuevos estandares de JavaScript

//-- MÓDULOS --
var Sist_Archivos = require('fs');                          //"fs"=Librería File System de Node la cual nos permite trabajar con el sistema de archivos de NodeJS
var Ruta = require('path');                                 //Con esta librería podemos acceder directamente a las rutas de nuestro sistema de archivos
var Moment = require('moment');                             //Nos va a permitir generar un timestamp, generar fechas, trabajar con ellas
var MongoosePaginacion = require('mongoose-pagination');    //Cargamos el módulo "mongoose-pagination" para poder realizar paginaciones de los listados

//-- MODELOS --
var Publicacion = require('../Modelos/Publicacion');        //Cargar el modelo de Usuarios creado en el archivo "Publicacion.js" dentro del a carpeta "Modelos"
var Usuario = require('../Modelos/Usuario');                //Cargar el modelo de Usuarios creado en el archivo "Usuario.js" dentro del a carpeta "Modelos"
var Follow = require('../Modelos/Follow');                  //Cargar el modelo de Follows creado en el archivo "Follow.js" dentro del a carpeta "Modelos"



//-- ACCIONES --
//Métodos de prueba
/* ----------------------------------------- */
function probando(pet,res)
{
    res.status(200).send({Mensaje: 'Accion de Pruebas con el Controlador de Publicaciones'});
}
/* ----------------------------------------- */

//Metodo para Agregar una Pubicación en la BDD
//"pet": Petición
//"res": Respuesta
function NuevaPublicacion(pet,res)
{
    var publicacion = new Publicacion();    //Creamos una instancia (Objeto) de Publicacion
    var params  = pet.body;                 //Recoger los parámetros que nos llegan por la petición, que nos llegan por POST


    //Comprobar si llegan todos los datos para guardar la Nueva Publicación
    if(!params.texto) return res.status(200).send({Mensaje: 'Debes Enviar un Texto.'})

    //Asignar valores al Objeto "publicacion"
    publicacion.id_usuario      = pet.UsuarioLogueado.sub;  //Es el ID del usuario logueado
    publicacion.texto           = params.texto;
    publicacion.archivo         = 'null';
    publicacion.fecha_creacion  = Moment().unix();

    //".save" = Método para guardar el documento en BDD, tiene una función de callback que regresa un error(err) o una Publicación guardada(publicGuardada)
    publicacion.save((err,publicGuardada) =>
    {
        //Se genera un error
        if(err) return res.status(500).send({Mensaje: 'Error al guardar la Publicación.'});

        //El objeto está vacio
        if(!publicGuardada) return res.status(404).send({Mensaje: 'La Publicación no ha sido Guardada.'});

        //Todo OK, regresamos el Objeto "publicacion"
        return res.status(200).send({publicacion: publicGuardada});
    });
}


//Método para obtener devolver el listado de Publicaciones de los Usuarios que el Usuario Logueado está siguiendo
//"pet": Petición
//"res": Respuesta
function ListarPublicUsuSeguidos(pet,res)
{
    //Recogemos el ID del usuario que esté logueado en este momento
    var UsuarioLogueado = pet.UsuarioLogueado.sub;

    var pagina = 1;         //Contador de página , por default le asignamos "1"

    var ElemsPorPag = 4;    //Cantidad de elementos que se van a mostrar por página

    //Comprobamos que por la URL nos llega el número de página y le actualizamos el valor
    if(pet.params.page)
    {
        pagina = pet.params.page;
    }

    //Obtenemos todos los follows de los usuarios que seguimos
    //"Follow.find()"   = Obtenemos todos los follows
    //"id_usuario:UsuarioLogueado"  = Buscamos todos los follows en donde el "id_usuario_que_sigue" sea el mismo que el usuario logueado
    //".populate('id_usuario_seguido')" = En lugar de solo el ID arrastra toda la información del Usuario
    //".exec" = Ejecutamos el query el cual tiene una función de callback que nos puede regresar un error(err) o unos seguimientos(follows)
    Follow.find({id_usuario_que_sigue:UsuarioLogueado}).populate('id_usuario_seguido').exec((err,seguimientos) =>
    {
        //Tenemos un Error
        if(err) return res.status(500).send({Mensaje:'Error al devolver el seguimiento.'});

        // ---- OBTENEMOS LOS DATOS COMPLETOS DE LOS USUARIOS A LOS QUE SIGUE EL USUARIO LOGUEADO ----
        var seguimientos_limpios = []; //Variable tipo arreglo
        //Recorremos el conjunto de documentos que nos regresó la búsqueda
        seguimientos.forEach((seguimiento) =>
        {
            seguimientos_limpios.push(seguimiento.id_usuario_seguido);    //Insertamos en el arreglo el ID del usuario que es seguido
        });

        //Al arreglo le agregamos el ID del Usuario Logueado
        seguimientos_limpios.push(UsuarioLogueado);

        // ---- AHORA OBTENEMOS TODAS LAS PUBLICACIONES DE DICHOS USUARIOS ----
        //"{id_usuario: {$in: seguimientos_limpios}}" = Vamos a buscar las publicaciones cuyo usuario(id_usuario) esté dentro de una colección
                                                        //de documentos que estan guardados en una variable, en este caso en un arreglo(seguimientos_limpios)
        //".sort('-fecha_creacion')" = Ordenamos las publicaciones en orden inverso, es decir, de la mas nueva a la mas vieja
        //".populate('id_usuario')" = Para que devuelva los datos completos del usuario en lugar de solo su ID
        //".paginate(pagina,ElemsPorPag,(err,publicaciones,total)" = Hacemos la paginación la cual tiene una función de callbacl que puede recibir un error(err)
                                                                    //o bien las publicaciones del usuario(publicaciones) y el total de pubicaciones(total)
        Publicacion.find({id_usuario: {$in: seguimientos_limpios}}).sort('-fecha_creacion').populate('id_usuario').paginate(pagina,ElemsPorPag,(err,publicaciones,total) =>
        {
            //Tenemos un Error
            if(err) return res.status(500).send({Mensaje:'Error al devolver las Publicaciones.'});

            //Se regresa el objeto vació, no hay publicaciones
            //Tenemos un Error
            if(!publicaciones) return res.status(404).send({Mensaje:'No hay Publicaciones que mostrar.'});

            //Todo OK
            return res.status(200).send({
                total_items: total,
                paginas: Math.ceil(total/ElemsPorPag),
                Pagina: pagina,
                elem_por_pagina: ElemsPorPag,
                publicaciones
            });


        });        
    });
}


//Método para obtener Obtener los datos de una Publicacion
//"pet": Petición
//"res": Respuesta
function ObtenerPublicacion(pet,res)
{
    var IdPublicacion = pet.params.id;  //Recogemos el valor "id" del parámetro que nos llega por la URL
                                        //Si nos llegan datos por POST o GET utilizamos "body"
                                        //Si nos llegan los datos por la URL utilizamos "params"

    //".findById"   = Buscamos un documento por su Id
    //(err,publicacion) = Función de callback con 2 parámetros de retorno: un posible error(err) o el objeto de una publicacion(publicacion) obtenido del a consulta a la BDD
    Publicacion.findById(IdPublicacion,(err,publicacion) =>
    {
        //Tenemos un Error
        if(err) return res.status(500).send({Mensaje:'Error en la Petición'});

        //La publicacion no nos llega, el objeto está vacío
        if(!publicacion) return res.status(404).send({Mensaje: 'La Publicación  NO existe.'});

        //Todo OK
        return res.status(200).send({publicacion});
    });
}


//Método para Eliminar una Publicación de la BDD siempre y cuando haya sido creada por el Usuario Logueado
//"pet": Petición
//"res": Respuesta
function EliminarPublicacion(pet,res)
{
    //Recogemos el ID del usuario que esté logueado en este momento
    var id_usuario = pet.UsuarioLogueado.sub;

    var IdPublicacion = pet.params.id;  //Recogemos el valor "id" del parámetro que nos llega por la URL
                                        //Si nos llegan datos por POST o GET utilizamos "body"
                                        //Si nos llegan los datos por la URL utilizamos "params"

    //".findOneAndRemove({id_usuario: UsuarioLogueado,'_id':IdPublicacion})" = Método de Mongoose, buscamos un documento de Publicacion cuyo Id sea igual al ID
                    //del Usuario Logueado y cuyo ID de publicacion sea igual al ID especificado en la URL y lo eliminamos de la BDD
    //".(err, publicElim)" = Función de callback con 2 parámetros de retorno: un posible error(err) y el objeto de la Publicación eliminada(publicelim)
    Publicacion.findOneAndRemove({'id_usuario': id_usuario, '_id': IdPublicacion},(err, publicElim) => 
    {
        //Ocurrió un Error
        if(err) return res.status(500).send({Mensaje: 'Error al borrar publicación'});

        //Se regresa el objeto vacío
        if(!publicElim) return res.status(404).send({Mensaje: 'La Publicación NO Pudo ser eliminada'});

        //Todo OK
        return res.status(200).send({Mensaje: 'Publicación Eliminada Correctamente'});
    });
}


//Método para Agregar una imagen a la Publicación
//"pet": Petición
//"res": Respuesta
function AgregaArchPublic(pet,res)
{
    var IdPublicacion = pet.params.id;  //Recogemos el valor "id" del parámetro que nos llega por la URL
                                        //Si nos llegan datos por POST o GET utilizamos "body"
                                        //Si nos llegan los datos por la URL utilizamos "params"

    //Comprobamos que nos estan llegando archivos
    //"files" = se consigue que exista gracias al "multiparty"
    //".image" = recomendable especificar esto ya que se evita conflicto si se ejecuta este metodo sin cargar una imagen"
    if(pet.files.imagen)
    {
        var Ruta_Archivo = pet.files.imagen.path;                //Variable con la ruta del archivo que se ha subido

        var Partes_Ruta = Ruta_Archivo.split('/');             //Generamos un arreglo con las partes de la cadena de la ruta del archivo
                                                                //que mas o menos es así: Uploads\Usuarios\imagen.jpg y al partirlo quedaria en 3 partes:
                                                                //[0]=Uploads, [1]=Usuarios, [2]=imagen.jpg

        var Nombre_Archivo = Partes_Ruta[2];                    //Obtenemos solo el nombre del archivo y está en la posición 2 del arreglo

        var Partes_Archivo = Nombre_Archivo.split('\.');        //Partimos el nombre del archivo en un arreglo de 2 partes: el nombre y la extensión

        var Extens_Archivo = Partes_Archivo[1].toLowerCase();   //Obtenemos la extensión del archivo que es la posición 1 del arreglo. "tolowercase" se usa porque
                                                                //parece ser que si la extención está en mayúsculas se genera error

        //Comprobamos la extensión del archivo
        if(Extens_Archivo == 'png' || Extens_Archivo == 'jpg' || Extens_Archivo == 'jpeg' || Extens_Archivo == 'gif')
        {
            //No aseguramos que el Usuario logueado sea quien hizo la Publicación
            //".findOne" = Buscamos un solo documento
            //"{'id_usuario':pet.UsuarioLogueado.sub}" = Si el "id_usuario" es el mismo que el Usuario Logueado y el ID de esa publicacion
                                //es el mismo que el de la publicacion actual
            //".exec((err,PublicOK)" = Executamos la query la cual tiene una función de callback que puede regresar un error(err) o bien el objeto
                                //del documento localizado
            Publicacion.findOne({'id_usuario':pet.UsuarioLogueado.sub, '_id':IdPublicacion}).exec((err,PublicOK) =>
            {
                //OK, Se regresa el objeto, la Publicacion actual es del Usuario Logueado
                if(PublicOK)
                {
                    //"findByIdAndUpdate()"         = Método para actualizar los datos del Usuario
                    //"IdUsuario"                   = El id del usuario a Modificar
                    //"{new: true}"                 = Para que al mandar a pantalla los datos del usuario muestre los actualizados, ya con la modificación que se hizo
                    //"(err,UsuarioActualizado)"    = Fnción de Callback, err=regresa un posible error que ocurrió, UsuarioActualizado = regresa el objeto "usuario" con los datos actualizados
                    Publicacion.findByIdAndUpdate(IdPublicacion,{archivo:Nombre_Archivo}, {new:true}, (err,PublicacActualizada) =>
                    {
                        //Se produce un error
                        if(err) return res.status(500).send({Mensaje: 'Error en la Petición para actualizar la Publicación.'});

                        //Hubo error en la actualización
                        if(!PublicacActualizada) return res.status(404).send({Mensaje: 'No se ha Logrado agregar un Archivo a la Publicación.'});

                        //La actualización fué correcta
                        res.status(200).send({Publicacion: PublicacActualizada});
                    });
                }
                //La publicación NO esdel Usuario Logueado
                else
                {
                    //Borramos el archivo
                    return RemoverArchivo(res,Ruta_Archivo,'No tienes Permiso para Actualizar esta Publicación.');
                }
            });
        }
        //La extensión NO es válida
        else
        {
            //Borramos el archivo
            return RemoverArchivo(res,Ruta_Archivo,'Extensión No válida.');
        }
    }
    //No llega ningun archivo
    else
    {
        res.status(200).send({Mensaje: 'No se ha subido el Archivo...'});
    }
}


//Esta función no se exporta, es de us interno
function RemoverArchivo(res,Ruta_Archivo, mensaje)
{
    //Dado que aunque la extensión no sea válida de todos modos el archivo es subido por lo que hay que borrarlo
    //usando el sistema de Archivos de NodeJS
    Sist_Archivos.unlink(Ruta_Archivo,(err) => 
    {
        res.status(200).send({Mensaje: mensaje});
    });
}

//Método que nos devuelve el archivo del a Publicación
//"pet": Petición
//"res": Respuesta
function ObtenerArchivoPublic(pet,res)
{
    var ArchivoImagen = pet.params.ArchivoImagen;               //Variable que almacena lo que nos llega por la URL
    var Ruta_Archivo = './Uploads/Publicaciones/'+ArchivoImagen; //Guardamos la ruta a nivel de carpeta, a nivel de fichero que tiene la imagen

    //Comprobamos si el archivo existe
    //"function(exists)" = función de callback que recibe el parámetro "exists"
    Sist_Archivos.exists(Ruta_Archivo, function(exists){
        //El archivo SI existe
        if(exists)
        {
            //Devolvemos el archivo en la respuesta y lo mostramos la imagen en el navegador en el formato que el navegador lo interprete
            res.sendFile(Ruta.resolve(Ruta_Archivo));
        }
        //El Archivo NO Existe
        else
        {
            res.status(404).send({Mensaje: 'El Archivo de la Publicación NO Existe...'});
        }
    });
}


//Método para obtener devolver el listado de Publicaciones de un sólo usuario
//"pet": Petición
//"res": Respuesta
function ListarPublicUnUsuario(pet,res)
{    
    var pagina = 1;         //Contador de página , por default le asignamos "1"

    var ElemsPorPag = 4;    //Cantidad de elementos que se van a mostrar por página

    //Comprobamos que por la URL nos llega el número de página y le actualizamos el valor
    if(pet.params.page)
    {
        pagina = pet.params.page;
    }

    //Recogemos el ID del usuario Logueado
    var user =  pet.UsuarioLogueado.sub;
    
    //En caso de estar recibiendo el ID del usuario a travez de la URL entonces nuestra variable adquiere ese valor
    if(pet.params.user)
    {
        user = pet.params.user;
    }

    // ---- AHORA OBTENEMOS TODAS LAS PUBLICACIONES DE DICHOS USUARIOS ----
    //"{id_usuario: Id_Usuario}"    = Vamos a buscar las publicaciones cuyo usuario(id_usuario) esté dentro de una colección
                                    //de documentos que estan guardados en una variable, en este caso en un arreglo(seguimientos_limpios)
    //".sort('-fecha_creacion')"    = Ordenamos las publicaciones en orden inverso, es decir, de la mas nueva a la mas vieja
    //".populate('id_usuario')"     = Para que devuelva los datos completos del usuario en lugar de solo su ID
    //".paginate(pagina,ElemsPorPag,(err,publicaciones,total)" = Hacemos la paginación la cual tiene una función de callbacl que puede recibir un error(err)
                                                              //o bien las publicaciones del usuario(publicaciones) y el total de pubicaciones(total)
    Publicacion.find({id_usuario: user}).sort('-fecha_creacion').populate('id_usuario').paginate(pagina,ElemsPorPag,(err,publicaciones,total) =>
    {
        //Tenemos un Error
        if(err) return res.status(500).send({Mensaje:'Error al devolver las Publicaciones.'});

        //Se regresa el objeto vació, no hay publicaciones
        //Tenemos un Error
        if(!publicaciones) return res.status(404).send({Mensaje:'No hay Publicaciones que mostrar.'});

        //Todo OK
        return res.status(200).send({
            total_items: total,
            paginas: Math.ceil(total/ElemsPorPag),
            Pagina: pagina,
            elem_por_pagina: ElemsPorPag,
            publicaciones
        });
    });
}




//-- Exportamos los Métodos --
module.exports =
{
    probando,
    NuevaPublicacion,
    ListarPublicUsuSeguidos,
    ObtenerPublicacion,
    EliminarPublicacion,
    AgregaArchPublic,
    ObtenerArchivoPublic,
    ListarPublicUnUsuario
};


