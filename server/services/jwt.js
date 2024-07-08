//Importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

// password
const secret = "PASS_SECRET_de_mi_red_social_987654"

//Crear una función para generar tokens
const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        rol: user.rol,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    };

    // Devolver jwt tokens codificado
    return jwt.encode(payload, secret);
}

module.exports = {
    secret,
    createToken
}



