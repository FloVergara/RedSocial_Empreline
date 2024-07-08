//Importar modelo
const Follow = require("../models/Follow");
const User = require("../models/User");

// Importar servicio
const followService = require("../services/followService");

// Importar dependencias
const mongoosePagination = require("mongoose-pagination");

//Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message:"Mensaje enviado desde: controllers/follow.js"
    });
}

// Acción de guardar un follow (seguir)
const save = async (req, res) => {
    // Conseguir los datos por body
    const params = req.body;

    // Sacar id del usuario identificado
    const identify = req.user;

    // Crear objeto con modelo follow
    let userToFollow = new Follow({
        user: identify.id,
        followed: params.followed
    });
    
    try {
        // Guardar objeto en bbdd
        const followStored = await userToFollow.save();

        // Devolver respuesta si el guardado fue exitoso
        return res.status(200).send({
            status: "success",
            identify: req.user,
            follow: followStored
        });
    } catch (error) {
        // Manejo de errores
        return res.status(500).send({
            status: "error",
            message: "No se ha podido seguir al usuario"
        });
    }
}

// Acción de borrar un follow (dejar de seguir)
const unfollow = async (req, res) => {
    // Tomar el id del usuario identificado
    const userId = req.user.id;

    // Tomar el id del usuario que sigo y quiero dejar seguir
    const followedId = req.params.id;

    try {
        // Encontrar y eliminar el registro de follow
        const result = await Follow.deleteOne({
            "user": userId,
            "followed": followedId
        });

        // Comprobar si el registro fue encontrado y eliminado
        if (result.deletedCount === 0) {
            return res.status(404).send({
                status: "error",
                message: "No se encontró la relación de follow para eliminar"
            });
        }

        // Devolver respuesta si la eliminación fue exitosa
        return res.status(200).send({
            status: "success",
            message: "Has dejado de seguir al usuario correctamente"
        });
    } catch (error) {
        // Manejo de errores
        return res.status(500).send({
            status: "error",
            message: "No se ha podido dejar de seguir al usuario"
        });
    }
}

// Acción listado de usuarios que cualquier usuario está siguiendo (siguiendo)
const following = async (req, res) => {
    // Sacar el id del usuario identificado.
    let userId = req.user.id;

    // Comprobar si me llegó el id por parámetro en URL.
    if (req.params.id) userId = req.params.id;

    // Comprobar si me llega la página, si no, la página 1.
    let page = 1;
    if (req.params.page) page = parseInt(req.params.page);

    // Usuarios por página quiero mostrar.
    const itemsForPage = 5;

    try {
        // Contar el total de documentos
        const total = await Follow.countDocuments({ user: userId });

        // Encontrar los follows con paginación
        const follows = await Follow.find({ user: userId })
            .populate("user followed", "-password -rol -__v -eamil")
            .skip((page - 1) * itemsForPage)
            .limit(itemsForPage)
            .lean(); // obtiene objetos JSON simples

        //Listado de usuarios
        // Sacar un array de ids de los usuarios que me siguen y los que sigo
        const followUserIdsResult = await followService.followUserIds(req.user.id);

        // Devolver respuesta si la búsqueda fue exitosa
        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que estoy siguiendo",
            follows,
            total,
            pages: Math.ceil(total / itemsForPage),
            currentPage: page,
            user_following: followUserIdsResult.following,
            user_follow_me: followUserIdsResult.followers
        });
    } catch (error) {
        // Manejo de errores
        return res.status(500).send({
            status: "error",
            message: "No se ha podido obtener la lista de usuarios que estás siguiendo",
            error: error.message
        });
    }
};

//Acción listado de usuarios que siguen a otro usuario (soy seguido, mis seguidores)
const followers = async (req, res) => {

    // Sacar el id del usuario identificado.
    let userId = req.user.id;

    // Comprobar si me llegó el id por parámetro en URL.
    if (req.params.id) userId = req.params.id;

    // Comprobar si me llega la página, si no, la página 1.
    let page = 1;
    if (req.params.page) page = parseInt(req.params.page);

    // Usuarios por página quiero mostrar.
    const itemsForPage = 5;


    try {
        // Contar el total de documentos
        const total = await Follow.countDocuments({ followed: userId }); 

        // Encontrar los follows con paginación
        const follows = await Follow.find({ followed: userId })
            .populate("user", "-password -rol -__v -email")
            .skip((page - 1) * itemsForPage)
            .limit(itemsForPage)
            .lean(); // obtiene objetos JSON simples

        const followUserIdsResult = await followService.followUserIds(req.user.id);

        // Devolver respuesta si la búsqueda fue exitosa
        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que me siguen",
            follows,
            total,
            pages: Math.ceil(total / itemsForPage),
            currentPage: page,
            user_following: followUserIdsResult.following,
            user_follow_me: followUserIdsResult.followers
        });
    } catch (error) {
        // Manejo de errores
        return res.status(500).send({
            status: "error",
            message: "No se ha podido obtener la lista de usuarios que estás siguiendo",
            error: error.message
        });
    }
}

//Exportar acciones
module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}