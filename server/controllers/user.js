// Importar dependencias y modulos
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs");
const path = require("path");

//Importar modelos
const User = require("../models/User");
const Follow = require("../models/Follow");
const Publication = require("../models/Publication");

//Importar servicios
const jwt = require("../services/jwt");
const followService = require("../services/followService");

//Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message:"Mensaje enviado desde: controllers/user.js",
        usuario: req.user
    });
}

//Registro de usuarios
const register = async (req, res) => {
    try {
        //Obtenemos datos de la petición
        let params = req.body;

        //Comprobamos si llegan bien (validación)
        if (!params.name || !params.username || !params.email || !params.password) {
            return res.status(400).json({
                status: "error",
                message: "Faltan datos",
            });
        }

        //Control de usuarios duplicados
        const users = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { username: params.username.toLowerCase() }
            ]
        }).exec();

        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });
        }

        //Cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        //Crear objeto de usuario
        let user_save = new User(params);

        //Guardar usuario en la bbdd
        const userStored = await user_save.save();
        if (!userStored) {
            return res.status(500).send({ status: "error", message: "Error al guardar el usuario" });
        }

        //Devolver resultado
        return res.status(200).json({
            status: "success",
            message: "Usuario registrado correctamente",
            user: userStored
        });
    } catch (error) {
        return res.status(500).json({ status: "error", message: "Error en la consulta de usuarios" });
    }
};

//Login de usuarios
const login = async (req, res) => {
    try {
        // Tomar parametros body
        let params = req.body;

        if (!params.email || !params.password) {
            return res.status(400).send({
                status: "error",
                message: "Faltan datos por enviar"
            });
        }

        // Buscar en la bbdd
        const user = await User.findOne({ email: params.email }).exec();
        if (!user) {
            return res.status(404).send({ status: "error", message: "No existe el usuario" });
        }

        //Comprobar su contraseña
        const pwd = bcrypt.compareSync(params.password, user.password);
        if (!pwd) {
            return res.status(400).send({
                status: "error",
                message: "No te has identificado correctamente"
            });
        }

        //Obtener token
        const token = jwt.createToken(user);

        //Devolver datos del usuario
        return res.status(200).send({
            status: "success",
            message: "Te has identificado correctamente",
            user: {
                id: user._id,
                name: user.name,
                username: user.username
            },
            token
        });
    } catch (error) {
        return res.status(500).send({ status: "error", message: "Error del servidor" });
    }
};

//Perfiles de usuario
const profile = async (req, res) => {
    try {
        //Recibir el parametro del id del usuario desde la url
        const id = req.params.id;

        //Consulta para sacar los datos del usuario
        const userProfile = await User.findById(id).select({ password: 0, rol: 0 }).lean();

        if (!userProfile) {
            return res.status(404).send({
                status: "error",
                message: "El usuario no existe o hay un error"
            });
        }

        //Info de seguimiento
        const followInfo = await followService.followThisUser(req.user.id, id);

        //Devolver el resultado
        return res.status(200).send({
            status: "success",
            user: userProfile,
            following: followInfo.following,
            follower: followInfo.follower
        });
    } catch (error) {
        return res.status(500).send({ status: "error", message: "Error del servidor" });
    }
};

//Lista de usuarios
const list = async (req, res) => {
    try {
        //Poder ver en que pagina estamos
        let page = 1;
        if (req.params.page) {
            page = req.params.page;
        }
        page = parseInt(page);

        //paginación con mongoose
        let itemsForPage = 5;

        const users = await User.find().select("-password -email -rol -__v").sort('_id').paginate(page, itemsForPage).exec();
        
        if (!users) {
            return res.status(404).send({
                status: "error",
                message: "No hay usuarios disponibles"
            });
        }

        //Listado de usuarios
        // Sacar un array de ids de los usuarios que me siguen y los que sigo
        const followUserIdsResult = await followService.followUserIds(req.user.id);

        //Devolvemos el resultado (antes la info de seguidos)
        return res.status(200).send({
            status: "success",
            users,
            page,
            itemsForPage,
            total: users.total,
            pages: Math.ceil(users.total / itemsForPage),
            user_following: followUserIdsResult.following,
            user_follow_me: followUserIdsResult.followers
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error del servidor",
            error
        });
    }
};

// Modificar datos del perfil
const update = async (req, res) => {
    try {
        // Recoger info del usuario a actualizar
        let userIdentify = req.user;
        let userToUpdate = req.body;

        // Eliminar campos sobrantes
        delete userToUpdate.iat;
        delete userToUpdate.exp;
        delete userToUpdate.rol;
        delete userToUpdate.image;

        // Comprobar si el usuario existe
        const users = await User.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { username: userToUpdate.username.toLowerCase() }
            ]
        }).exec();

        let userIsset = false;
        users.forEach(user => {
            if (user && user._id != userIdentify.id) userIsset = true;
        });

        if (userIsset) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            });
        }

        // Cifrar la contraseña
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = pwd;
        }else{
            delete userToUpdate.password;
        }

        // Buscar y actualizar
        const userUpdated = await User.findByIdAndUpdate({ _id: userIdentify.id }, userToUpdate, { new: true }).exec();

        if (!userUpdated) {
            return res.status(404).send({
                status: "error",
                message: "No se ha podido actualizar el usuario"
            });
        }

        // Devolver el resultado
        return res.status(200).send({
            status: "success",
            message: "Usuario actualizado correctamente",
            user: userUpdated
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error del servidor"
        });
    }
};

//subida de archivos
const upload = async (req, res) => {

    // Tomar el fichero de imagen y comprobar que existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "La petición no incluye la imagen"
        });
    }

    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // Sacar la extensión del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[1];

    // Comprobar extensión
    if (extension !== "png" && extension !== "jpg" && extension !== "jpeg" && extension !== "gif") {

        // Borrar archivo subido
        const filePath = req.file.path;
        fs.unlinkSync(filePath);

        // Devolver respuesta negativa
        return res.status(400).send({
            status: "error",
            message: "Extensión del archivo inválida"
        });
    }

    try {
        // Si es correcta, guardar imagen en bbdd
        const userUpdated = await User.findOneAndUpdate(
            { _id: req.user.id },
            { image: req.file.filename },
            { new: true }
        );

        if (!userUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida de la imagen"
            });
        }

        // Devolver respuesta si la actualización fue exitosa
        return res.status(200).send({
            status: "success",
            user: userUpdated,
            file: req.file,
        });
    } catch (error) {
        // Manejo de errores
        return res.status(500).send({
            status: "error",
            message: "Error en la subida de la imagen",
        });
    }
};

//Borrado de imagen desde el usuario
const avatar = (req, res) => {
    // Sacar el parametro de la URL
    const file = req.params.file;

    // Escribir el path real de la imagen
    const filePath = "./uploads/avatar/"+file;

    // Comprobar que existe
    fs.stat(filePath, (error, exists) => {

        if(!exists){ 
            return res.status(404).send({
                status: "error", 
                message: "No existe la imagen"
            });
        }
        
        // Devolver un file
        return res.sendFile(path.resolve(filePath));
    });

    
}

//Contador de seguidores, seguidos y publicaciones
const counters = async (req, res) => {

    let userId = req.user.id;

    if(req.params.id){
        userId = req.params.id;
    }

    try {
        const following = await Follow.countDocuments({ "user": userId });

        const followed = await Follow.countDocuments({ "followed": userId });

        const publications = await Publication.countDocuments({ "user": userId });
        
        return res.status(200).send({
            userId,
            following: following,
            followed: followed,
            publications: publications
        });
    } catch (error) {
        return res. status(500).send({
            status: "error",
            message: "Error en el contador",
            error
        });
    }
}

//Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar,
    counters
}