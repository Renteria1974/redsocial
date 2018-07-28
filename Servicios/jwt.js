// SERVICO
//Nos permite generar un token que será devuelto (en lugar de los datos) cuando se ha logueado correctamente a un usuario
//JSON = Formato de texto Ligero de intercambio de datos basado en un subconjunto del Lenguaje de Programación JavaScript, es independiente del lenguaje que se utiliza
//      puede representae 4 tipos primitivos (cadenas, números, booleanos, valores nulos) y 2 estructurados (objetos y arreglos)
//JWT (JSON WEB TOKEN) = Conjunto de medios de seguridad para peticiones http para representar demandas para ser transferidos entre el cliente y el servidor. Es un
//       Contenedor de Información referente a la autenticación de un usuario. Las partes de un JWT se codifican como un objeto que está firmado digitalmente
//       utilizando JWS (JSON Web Signature)

'use strict'                                                    //Significa que puede usar las nuevas instrucciones de los nuevos estandares de JavaScript

var jwt = require('jwt-simple');                                //Importar el módulo de JWT, las librerías JWT, para poder acceder a sus métodos

var moment = require('moment');                                 //Nos va a permitir generar un timestamp, generar fechas, trabajar con ellas

var secret = 'Clave_Secreta_Proyecto_de_Red_Social';            //Creamos una clave secreta


//"exports.reateToken" = Se exporta directamente un método llamado "CreateToken"
//"function(usuario)"   = Función anónima que va a recibir un objeto de Usuario que es el que se está intentando loguear y al que se le quiere generar el Token
exports.createToken = function(usuario)
{
    //"payload" Es un objeto con el cual JWT va a trabajar para generar el cifrado o token, va a contener un objeto con los datos del usuario que se quiere codificar
    var payload =
    {
        sub:            usuario.id,                     //Propiedad que identifica al id del usuario dentro de JWT
        nombre:         usuario.nombre,
        apellido:       usuario.apellido,
        nick:           usuario.nick,
        email:          usuario.email,
        rol:            usuario.rol,
        imagen:         usuario.imagen,
        fechainicia:    moment().unix(),                //Fecha de creación del token
        fechaexpira:    moment().add(30,'days').unix()  //Fecha de expiración del token, en este caso es de 30 días
    };

    //Generamos,Codificamos el token.
    //"payload" = Contiene los datos del usuario
    //"secret"  = al token le agregamos la clave secreta
    return jwt.encode(payload,secret);
};