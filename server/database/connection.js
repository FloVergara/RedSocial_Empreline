const mongoose = require('mongoose');

const connection = async() => {

    try{
        await mongoose.connect("mongodb://127.0.0.1:27017/rs_empreline");

        console.log("Conectado correctamente a db: rs_empreline");

    } catch(error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la base de datos !!")
    }
}

module.exports = connection