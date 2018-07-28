//MIDDLEWARE =  Método o función que se va a ejecutar antes de que se ejecute la acción del Controlador, de forma que al hacer una petición HTTP lo primero
//              que se va a comprobar es si la autentificación del token es correcto y en caso de ser así se va a pasar al método del controlador

'use strict'                                                    //Significa que puede usar las nuevas instrucciones de los nuevos estandares de JavaScript

var jwt = require('jwt-simple');                                //Cargamos el Servicio que creamos en el archivo "jwt.js" dentro de la carpeta "Servicios"

var moment = require('moment');                                 //Nos va a permitir generar un timestamp, fecha

var secret = 'Clave_Secreta_Proyecto_de_Red_Social';            //Esta clave secreta debe ser la misma que se creó en el archivo "j2t.js" dentro del a carpeta "Servicios"


//"exports.ensureAuth":         Se exporta directamente un método llamado "ensureAuth"
//"function(pet,res,next)":     Función anónima que va a recibir 3 parámetros: pet(petición),res(respuesta), next(pasar al siguiente paso de la petición http)
exports.ensureAuth=function(pet,res,next)
{
    //NO Llega la cabecera de autenticación, abortamos la autenticación
    if(!pet.headers.authorization)
    {
        return res.status(403).send({message: 'La Petición No tiene la Cabecera de Autenticación.'});
    }

    //Recogemos la cabecera de autorización (y la guardamos dentro de la variable "token"), con "replace" sustituimos las comillas simples o dobles por una cadena vacia
    var token = pet.headers.authorization.replace(/['"]+/g,'');

    //Se lanza esta excepción porque el "payload" es muy sensible a que devuelva un error y provocar que se congele la aplicación
    try
    {
        //Decodificamos el token. El "payload" sería el objeto completo con todos los datos que tiene dentro el token: id, nombre, email, etc. del usuario
        //".decode" = Método para decodificar le token
        var payload = jwt.decode(token,secret);

        //"payload.exp <= moment.unix()" = Nos aseguramos que el token aun no expire
        if(payload.exp <= moment.unix())
        {
            return res.status(401).send({message: 'El Token ha expirado.'});
        }
    }
    //Capturamos las posibles excepciones que se presenten a consecuencia del "payload"
    catch(ex)
    {
        return res.status(404).send({message: 'El Token no es válido.'});
    }

    //Seteamos una nueva propiedad dentro de "pet", creamos la propiedad "usuario"
    //se podrá utilizar en todos los métodos de los controladores, en todas las acciones
    pet.UsuarioLogueado = payload;

    //Pasamos al siguiente método de la ruta, es para que el middleware no entre en bucle infinito, que salga de aquí
    next();
}