// ++ CONTROLADOR DE "USUARIOS"  ++
//Reciben las peticiones HTTP y de hacer la lógica y funcionalidad de cada Método

'use strict'                                                //Significa que puede usar las nuevas instrucciones de los nuevos estandares de JavaScript

//-- MÓDULOS --
var bcrypt = require('bcrypt-nodejs');                      //Cargamos el módulo "bcrypt", esto nos permite hacer un cifrado de passwords
var MongoosePaginacion = require('mongoose-pagination');    //Cargamos el módulo "mongoose-pagination" para poder realizar paginaciones de los listados
var Sist_Archivos = require('fs');                          //"fs"=Librería File System de Node la cual nos permite trabajar con el sistema de archivos de NodeJS
var Ruta = require('path');                                 //Con esta librería podemos acceder directamente a las rutas de nuestro sistema de archivos

//-- MODELOS --
var Usuario = require('../Modelos/Usuario');                //Cargar el modelo de Usuarios creado en el archivo "usuario.js" dentro del a carpeta "Modelos"
var Follow = require('../Modelos/Follow');                  //Cargar el modelo de Follows creado en el archivo "Follow.js" dentro del a carpeta "Modelos"
var Publicacion = require('../Modelos/Publicacion');        //Cargar el modelo de Usuarios creado en el archivo "Publicacion.js" dentro del a carpeta "Modelos"

//SERVICIO JWT
var jwt = require('../Servicios/jwt');                      //Cargamos el Servicio (Token JWT) que creamos en el archivo "jwt.js" dentro de la carpeta "Servicios"



//-- ACCIONES --
//Métodos de prueba
/* ----------------------------------------- */
function home(req,res)
{
    res.status(200).send({
        message: 'Hola mundo desde le Servidor de NodeJS'
    })
}

function pruebas(req,res)
{
    res.status(200).send({
        message: 'Accion de Pruebas en el Servidor de NodeJS'
    })
}
/* ----------------------------------------- */


//Metodo para Agregar un Usuario a la BDD
//"pet": Petición
//"res": Respuesta
function NuevoUsuario(pet,res)
{
    var usuario = new Usuario();    //Creamos una instancia (Objeto) de Usuario
    var params  = pet.body;         //Recoger los parámetros que nos llegan por la petición, que nos llegan por POST

    //Comprobar si llegan todos los datos para guardar el nuevo Usuario
    if(params.password && params.nombre && params.apellido && params.email && params.nick)
    {
        //Asignar valores al Objeto Usuario
        usuario.nombre      = params.nombre;
        usuario.apellido    = params.apellido;
        usuario.nick        = params.nick;
        usuario.email       = params.email;
        usuario.rol         = 'ROLE_USER';
        usuario.imagen      = 'Null';


        //Verificamos que el "email" y/o el "nick" del usuario nuevo no exista ya en la BDD y de ser así se rechaza al nuevo usuario
        //"$or" = Indica que vamos a hacer la búsqueda de coincidencias de ono o mas valores dentro de un arreglo
        //Buscamos en la colección de Usuarios(Ususario) un solo documento(find) cuyo email(email) sea igual al email que llega por POST(usuario.email.toLowerCase)
        //".exec" = Utilizamos el método "exec" para ejecutar el callback con una función de flecha que va a recibir un error(err) o unos usuarios(usuarios) 
        Usuario.find({ $or:    [
                                {email: usuario.email.toLowerCase()},
                                {nick: usuario.nick.toLowerCase()}
                            ]}).exec((err,usuarios) =>
                            {
                                //Se genera un error
                                if(err) return res.status(500).send({Mensaje: 'Error en la Petición de Usuarios'});
                                //Si nos llegan usuarios, es decir, puede haber un usuario que ya tiene el password y otro usuario que ya tiene el nick
                                if(usuarios && usuarios.length>=1)
                                {
                                    return res.status(200).send({Mensaje: 'El usuario que intentas registrar ya existe!!'});
                                }
                                //Todo OK
                                else
                                {
                                    //Ciframos la contraseña
                                    //".hash"       = Método para cifrar la contraseña
                                    //"null"        = No los usamos por lo pronto, son para cambiar los algoritmos de cifrado
                                    //"function(err,hash)"  = Función de callback que contiene un error (err) y la contraseña generada y encriptada (hash)
                                    bcrypt.hash(params.password,null,null, function(err,hash)
                                    {
                                        usuario.password=hash; //Asignamos a nuestro campo "password" el valor ya encriptado

                                        //Guardamos los valores del Nuevo Usuario en la BDD
                                        //".save"           = Método de mongoose
                                        //"err"             = Error
                                        //"usuarioGuardado" = Usuario Guardado, es todo el objeto con todos los datos del nuevo usuario
                                        usuario.save((err,usuarioGuardado) =>
                                        {
                                            //En caso de ocurrir un error salimos del proceso con "return" y enviamos el mensaje
                                            if(err) return res.status(500).send({Mensaje: 'Error al Guardar el Usuario'});

                                            //Se procede a guardar en BDD
                                            //Todo OK
                                            if(usuarioGuardado)
                                            {
                                                res.status(200).send({usuario: usuarioGuardado});
                                            }
                                            //Si por alguna razón no se guardo correctamente en BDD
                                            else
                                            {
                                                res.status(404).send({Mensaje: 'No se ha Registrado el Usuario'});
                                            }
                                        });
                                    });
                                }
                            });        
    }
    //No se tienen valores válidos para el Usuario
    else
    {
        res.status(200).send({Mensaje:'Introduce los datos Correctamente para poder Registrar al Usuario'});
    }
}


//Metodo para Comprobar que un Usuario existe
//"pet": Petición
//"res": Respuesta
function LoguearUsuario(pet,res)
{
    var params = pet.body;              //Recibimos los datos del "body" que no lelegan por POST
    var email = params.email;           //Variable que guarda el valor de "email" del objeto "params"
    var password = params.password;     //Variable que guarda el valor de "password" del objeto "params"

    //Verificamos que el email del usuario nuevo SI exista en la BDD 
    //Buscamos en la colección de Usuarios(Usuario) un solo documento(findOne) cuyo email(email) sea igual al email que llega por post(email)
    //se tiene una función de callback que recibe como parámetro un error(err) o un usuario que existe(usuario)
    Usuario.findOne({email: email},(err,usuario) =>
    {
        //Si hay algún error en la búsqueda
        if(err)
        {
            res.status(500).send({Mensaje: 'Error al comprobar el Usuario'});
        }
        //Todo OK
        else
        {
            //Retorna un registro, el usuario ya existe
            if(usuario)
            {
                //Se pasa el password que se está recibiendo por POST(password) y el password que está en BDD(usuario.password) y se comparan
                //Se usa una función de callback que recibe un error(err) y un chequeado(check) para saber si la comparativa fue cierta o falsa
                bcrypt.compare(password,usuario.password,(err,check) => 
                {
                    //La comparativa es TRUE, los valores son los mismos
                    if(check)
                    {
                        //Si deseamos generar el Token
                        if(params.gettoken)
                        {
                            //Generar y devolver Token
                            return res.status(200).send({
                                token: jwt.createToken(usuario)
                            });
                        }
                        //Sólo devolvemos el usuario
                        else
                        {
                            //Por cuestiones de seguridad NO devolvemos el password
                            usuario.password = undefined;

                            res.status(200).send({usuario});
                        }
                    }
                    else
                    {
                        res.status(404).send({Mensaje: 'El Usuario NO ha podido Loguearse Correctamente.'});
                    }
                });
            }
            //No retorna ningun registro, es decir, el usuario (email) no existe
            else
            {
                res.status(404).send({Mensaje: 'El Usuario NO ha podido Loguearse, NO Existe.'});
            }
        }
    });
}


//Método para obtener los datos de un Usuario
//"pet": Petición
//"res": Respuesta
function ObtenerUsuario(pet,res)
{
    var IdUsuario = pet.params.id;  //Recogemos el valor "id" del parámetro que nos llega por la URL
                                    //Si nos llegan datos por POST o GET utilizamos "body"
                                    //Si nos llegan los datos por la URL utilizamos "params"

    //".findById"   = Buscamos un documento por su Id
    //(err,usuario) = Función de callback con 2 parámetros de retorno: un posible error(err) o el objeto de un usuario(usuario) obtenido del a consulta a la BDD
    Usuario.findById(IdUsuario,(err,usuario) =>
    {
        //Tenemos un Error
        if(err) return res.status(500).send({Mensaje:'Error en la Petición'});

        //El usuario no nos llega, el objeto está vacío
        if(!usuario) return res.status(404).send({Mensaje: 'El Usuario NO existe.'});

        //Función que nos regresa si el usuario logueado sigue al usuario de la URL y viceversa
        //Con esta función ASINCRONA,devuelve una promesa
        //".then()" = Método con una función de callback que regresa un valor(valor)
        Siguiendose(pet.UsuarioLogueado.sub,IdUsuario).then((valor)=>
        {
            //Por cuestiones de seguridad no mostramos el Password
            usuario.password = undefined;

            //Todo OK
            return res.status(200).send({
                usuario,
                siguiendo_a: valor.siguiendo_a,
                se_sigue: valor.se_sigue
            });
        }); 
    });
}


//Método que nos regresa si el usuario logueado sigue al usuario de la URL y viceversa
//"async" = ESTA FUNCIÓN LA HACEMOS "ASINCRONA", así la podemos ejecutar en cualquier parte de otros métodos. Y las consultas que hay dentro
            //de ella que sean SINCRONAS, es decir, que se espere a conseguir el resultado de una ejecución para continuar con lo siguiente
//"usuario_logueado"    = Usuario logueado actualmente 
//"usuario_consultado"  = Usuario especificado en la URL
async function Siguiendose(usuario_logueado, usuario_consultado)
{
    //"await"       = Para que la consulta se convierta en una llamada SINCRONA
    //".findOne()"  = Se busca un solo documento en el cual el usuario logueado (pet.UsuarioLogueado.sub) esté siguiendo al
                    //usuario del que se estan obteniendo sus datos (IdUsuario)
    //".exec"       = Se executa la query
    try
    {
        //El Usuario Logueado sigue al usuario de la URL
        var siguiendo_a = await Follow.findOne({ id_usuario_que_sigue: usuario_logueado, id_usuario_seguido: usuario_consultado}).exec()
            .then((siguiendo_a) =>
            {
                return siguiendo_a;
            })
            .catch((err)=>
            {
                return handleError(err);
            });

        //El Usuario de la URL sigue al usuario Logueado
        var se_sigue = await Follow.findOne({ id_usuario_que_sigue: usuario_consultado, id_usuario_seguido: usuario_logueado}).exec()
            .then((se_sigue) =>
            {
                return se_sigue;
            })
            .catch((err)=>
            {
                return handleError(err);
            });
        return {
            siguiendo_a: siguiendo_a,
            se_sigue: se_sigue
        }
    }
    catch(e)
    {
        return handleError(err);
    }
}


//Método para obtener devolver un listado de Usuarios (de forma paginada)
//"pet": Petición
//"res": Respuesta
function ListarUsuarios(pet,res)
{
    //Por la URL va a recibir un número de página por consiguiente va a paginar el listado de usuarios actuales

    //Recogemos el ID del usuario que esté logueado en este momento
    //"pet.UsuarioLogueado.sub" = De aqui tomamos el ID, esto es porque al loguear y generar token se genera un objeto "usuario" y en su campo "sub" está el "id" de dicho usuario
    var UsuarioLogueado = pet.UsuarioLogueado.sub;

    var pagina = 1;         //Contador de página , por default le asignamos "1"

    var ElemsPorPag = 5;    //Cantidad de elementos uqe se van a mostrar por página

    //Comprobamos que por la URL nos llega el número de página y le actualizamos el valor
    if(pet.params.page)
    {
        pagina = pet.params.page;
    }

    //Obtenemos todos los usuarios registrados en la BDD
    //"Usuario.find()"  = Obtenemos todos los usuarios
    //"sort('_id')"     = Ordenamos el listado por ID
    //".paginate"       = Método usado para paginar los resultados, sus parámetros son la página actual(pagina), el # de elementos por página(elemsporpag) y
                        //una función de callback que puede regresar un error(err), los usuarios que va a devolver la query a la BDD y un total de registros
                        //que hay en la colección de la BDD
    Usuario.find().sort('_id').paginate(pagina,ElemsPorPag,(err,usuarios,Total_Usuarios) =>
    {
        //Tenemos un Error
        if(err) return res.status(500).send({Mensaje:'Error en la Petición'});

        //El listado de Usuarios no nos llega, el objeto está vacío
        if(!usuarios) return res.status(404).send({Mensaje: 'No hay Usuarios Registrados.'});


        //Método que no s regresa a quien sigue el usuario Logueado y quienes lo siguen a él
        //Con esta función ASINCRONA,devuelve una promesa
        //".then()" = Método con una función de callback que regresa un valor(valor)
        SiguiendoseTodos(UsuarioLogueado).then((valor) =>
        {
            //Todo OK, regresamos el listado de usuarios
            //"Math.ceil(total/ElemsPorPag)" = Redondear la número de páginas
            return res.status(200).send({
                usuarios,
                Usuarios_que_sigo: valor.siguiendo_a,
                Usuarios_me_siguen: valor.seguido,
                Total_Usuarios,
                Páginas: Math.ceil(Total_Usuarios/ElemsPorPag)
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


//Método para Actualizar los datos del Usuario
//"pet": Petición
//"res": Respuesta
function ActualizarUsuario(pet,res)
{
    var IdUsuario = pet.params.id;  //Recogemos el valor "id" del parámetro que nos llega por la URL
                                    //Si nos llegan datos por POST o GET utilizamos "body"
                                    //Si nos llegan los datos por la URL utilizamos "params"

    var NuevosDatos = pet.body;    //Recogemos los datos que tenemos en el body (los valores nuevos) para modificar el usuario

    var usuario_existe = false      //Para controlar si se puede o no modificar lso datos del usuario


    //Borramos la propiedad "password" de nuestro objeto usuario (que lógicamente no deseamos actualizar) para que no se guarde con valor vacío
    delete NuevosDatos.password;

    //En caso de que el "IdUsuario" es distinto al usuario que está logueado actualmente entonces no permitimos el proceso,
    //es decir, un usuario no puede modificar los datosde otor usuario (al menos en este método)
    //"pet.UsuarioLogueado.sub" = Es el objeto que se crea cuando generamos el token al iniciar sesión de trabajo
    if(IdUsuario != pet.UsuarioLogueado.sub) return res.status(500).send({Mensaje: 'No tienes Permiso para actualizar al Usuario'});
    
    
    //Verificamos que el "email" y/o el "nick" del usuario nuevo no exista ya en la BDD y de ser así se rechaza la modificación al usuario    
    //"$or" = Indica que vamos a hacer la búsqueda de coincidencias de uno o mas valores dentro de un arreglo
    //Buscamos en la colección de Usuarios(Usuario) un solo documento(find) cuyo email(email) sea igual al email que llega por POST(usuario.email.toLowerCase)
    //".exec" = Utilizamos el método "exec" para ejecutar el callback con una función de flecha que va a recibir un error(err) o unos usuarios(usuarios) 
    //"((err,usuarios))" = Va a recibir un error(err) o uno o más usuarios(usuarios)
    Usuario.find({ $or: [
        {email: NuevosDatos.email.toLowerCase()},
        {nick: NuevosDatos.nick.toLowerCase()}
    ]}).exec((err,usuarios) =>{       
        //Recorremos usuarios que recibimos
        usuarios.forEach((usuario) =>{
            //El usuario que se localiza NO es el usuario actualmente Logueado, significa que el nick o el email ya existen para otro usuario
            if( usuario && (usuario._id != IdUsuario)) usuario_existe = true;
        });
        if(usuario_existe) return res.status(404).send({Mensaje: 'El Nick o el Email ya pertenecen a otro Usuario'}); 

        // ++ ACTUALIZAMOS LA INFORMACIÓN DEL USUARIO ++
        //"findByIdAndUpdate(IdUsuario,NuevosDatos, (err,userUpdated)" = Método para actualizar los datos del Usuario
        //"IdUsuario"                   = El id del usuario a Modificar
        //"NuevosDatos"                 = Indicamos que es una actualización
        //"{new: true}"                 = Para que al mandar a pantalla los datos del usuario muestre los actualizados, ya con la modificación que se hizo
        //"(err,UsuarioActualizado)"    = Función de Callback, err=regresa un posible error que ocurrió, UsuarioActualizado = regresa el objeto "usuario" con los datos actualizados
        Usuario.findByIdAndUpdate(IdUsuario,NuevosDatos, {new:true}, (err,UsuarioActualizado) =>
        {
            //Se produce un error
            if(err) return res.status(500).send({Mensaje: 'Error en la Petición para actualizar la Imagen del Usuario.'});

            //Hubo error en la actualización
            if(!UsuarioActualizado) return res.status(404).send({Mensaje: 'No se ha Logrado Actualizar la Imagen del Usuario'});

            //La actualización fué correcta
            res.status(200).send({usuario: UsuarioActualizado});
        });
    });
}


//Método para subir la imagen/avatar del usuario
//"pet": Petición
//"res": Respuesta
function SubirImagen(pet,res)
{
    var IdUsuario = pet.params.id;  //Recogemos el valor "id" del parámetro que nos llega por la URL
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

        //En caso de que el "IdUsuario" es distinto al usuario que está logueado actualmente entonces no permitimos el proceso,
        //es decir, un usuario no puede modificar los datosde otor usuario (al menos en este método)
        //"pet.UsuarioLogueado.sub" = Es el objeto que se crea cuando generamos el token al iniciar sesión de trabajo
        if(IdUsuario != pet.UsuarioLogueado.sub)
        {
            //Borramos el archivo
            return RemoverArchivo(res,Ruta_Archivo,'No tienes Permiso para actualizar al Usuario');
        }

        //Comprobamos la extensión del archivo
        if(Extens_Archivo == 'png' || Extens_Archivo == 'jpg' || Extens_Archivo == 'jpeg' || Extens_Archivo == 'gif')
        {
            //La condición anterior no se cumple, es decir, el userid es igual al usuario que tenemos logueado
            //"findByIdAndUpdate()"         = Método para actualizar los datos del Usuario
            //"IdUsuario"                   = El id del usuario a Modificar
            //"{new: true}"                 = Para que al mandar a pantalla los datos del usuario muestre los actualizados, ya con la modificación que se hizo
            //"(err,UsuarioActualizado)"    = Fnción de Callback, err=regresa un posible error que ocurrió, UsuarioActualizado = regresa el objeto "usuario" con los datos actualizados
            Usuario.findByIdAndUpdate(IdUsuario,{imagen:Nombre_Archivo}, {new:true}, (err,UsuarioActualizado) =>
            {
                //Se produce un error
                if(err) return res.status(500).send({Mensaje: 'Error en la Petición para actualizar la Imagen del Usuario.'});

                //Hubo error en la actualización
                if(!UsuarioActualizado) return res.status(404).send({Mensaje: 'No se ha Logrado Actualizar la Imagen del Usuario'});

                //La actualización fué correcta
                res.status(200).send({usuario: UsuarioActualizado});
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
        res.status(200).send({Mensaje: 'No se han subido Archivos...'});
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


//Método que nos devuelve una imagen, un archivo
//"pet": Petición
//"res": Respuesta
function ObtenerArchImagen(pet,res)
{
    var ArchivoImagen = pet.params.ArchivoImagen;           //Variable que almacena lo que nos llega por la URL
    var Ruta_Archivo = './Uploads/Usuarios/'+ArchivoImagen; //Guardamos la ruta a nivel de carpeta, a nivel de fichero que tiene la imagen

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
            res.status(404).send({Mensaje: 'El Archivo de la Imagen NO Existe...'});
        }
    });
}


//Método que nos devuelve Los contadores de los usuarios que seguimos y usuarios que nos siguen, cuantas publicacionestenemos, etc.
//"pet": Petición
//"res": Respuesta
function ObtenerContadores(pet,res)
{
    var IdUsuario = pet.UsuarioLogueado.sub;    //Tomamos el ID del usuario Logueado

    //El usuario es el que recibimos el parámetro "ID" por la URL
    if(pet.params.id)
    {
        IdUsuario = pet.params.id;  //La variable toma el valor del ID recibido por la URL
    }

    //Mandamos llamar al método ASÍNCRONO que nos regresa los contadores
    Contador_sigue_lo_siguen(IdUsuario).then((valor) =>
    {
        return res.status(200).send(valor);
    });
}


//"async": ESTA FUNCIÓN LA HACEMOS "ASINCRONA", así la podemos ejecutar en cualquier parte de otros métodos. Y las consultas que hay dentro
            //de ella que sean SINCRONAS, es decir, que se espere a conseguir el resultado de una ejecución para continuar con lo siguiente
//"usuario_logueado": Usuario especificado en la URL
async function Contador_sigue_lo_siguen(id_usuario)
{
    try
    {
        //Contamos el total de documentos en los cuales el usuario que sigue sea igual al "usuario_logueado"
        //"exec" = Ejecutamos el query, la consulta que nos regresa una función de callback que regresa un error(err) o un valor(contador)
        var siguiendo_a = await Follow.count({"id_usuario_que_sigue": id_usuario}).exec().then((contador) =>
            {
                return contador;
            })
            .catch((err)=>
            {
                return handleError(err);
            });

        //Contamos el total de documentos en los cuales el usuario al que se sigue sea igual al "usuario_logueado"
        //"exec" = Ejecutamos el query, la consulta que nos regresa una función de callback que regresa un error(err) o un valor(contador)
        var lo_siguen = await Follow.count({"id_usuario_seguido": id_usuario}).exec().then((contador) =>
            {
                return contador;
            })
            .catch((err)=>
            {
                return handleError(err);
            });


        //".count({"id_usuario"=id_usuario})" = Vamos a ocntar todas las Publicaciones siempre y cuando el usuario que las generó sea  el
                    //Usuario Logueado
        //".exec((err,contador)" = Ejecutamso el query el cual tiene una función de callback que recibe 2 parámetros: un error(err) y el
                    //total de objetos localizados(contador)
        var publicaciones = await Publicacion.count({"id_usuario":id_usuario}).exec().then((contador) =>
            {
                return contador;
            })
            .catch((err)=>
            {
                return handleError(err);
            });

        return {
            siguiendo_a:siguiendo_a,
            lo_siguen:lo_siguen,
            Publicaciones: publicaciones
        }

    }
    catch(e)
    {
        return handleError(err);
    }
}


//-- Exportamos los Métodos --
module.exports =
{
    home,
    pruebas,
    NuevoUsuario,
    LoguearUsuario,
    ObtenerUsuario,
    ListarUsuarios,
    ActualizarUsuario,
    SubirImagen,
    ObtenerArchImagen,
    ObtenerContadores
};