// Importar modulos
const fs = require("fs");
const path = require("path");

//Importar modelos
const Publication = require("../models/Publication");

// Importar servicios
const followService = require("../services/followService");

//Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message:"Mensaje enviado desde: controllers/publication.js"
    });
}

//Guardar publicación
const save = async (req, res) => {
    try {
        //Tomar datos del body
        const params = req.body;

        //SI no me llegan, dar respuesta negativa
        if (!params.text) {
            return res.status(400).send({
                status: "error",
                message: "Debes enviar el texto de la publicación"
            });
        }

        //Crear y rellenar el objeto del modelo
        const newPublication = new Publication(params);
        newPublication.user = req.user.id;

        //Guardar objeto de bbdd
        const publicationStored = await newPublication.save();

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Publicación guardada",
            publicationStored
        });
    } catch (error) {
        // Manejar errores
        return res.status(400).send({
            status: "error",
            message: "No se ha guardado la publicación",
            error: error.message
        });
    }
}

// Sacar una publicación
const detail = async (req, res) => {
    try {
        // Sacar id de publicación de la url
        const publicationId = req.params.id;

        // Find con la condición de la id
        const publicationStored = await Publication.findById(publicationId);

        if (!publicationStored) {
            return res.status(404).send({
                status: "error",
                message: "No existe la publicacion"
            });
        }

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Mostrar publicación",
            publication: publicationStored
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al buscar la publicacion"
        });
    }
};

// Eliminar publicaciones
const remove = async (req, res) => {
    try {
        // Sacar el id de la publicación a eliminar
        const publicationId = req.params.id;

        // Find y luego un deleteOne
        const publicationRemoved = await Publication.findOneAndDelete({ "user": req.user.id, "_id": publicationId });

        if (!publicationRemoved) {
            return res.status(500).send({
                status: "error",
                message: "No se ha podido eliminar la publicación",
            });
        }

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Publicación eliminada",
            publication: publicationRemoved
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error al intentar eliminar la publicación",
        });
    }
}

// Listar publicaciones de un usuario
const user = async (req, res) => {
    try {
        // Sacar el id del usuario
        const userId = req.params.id;

        // Controlar la página
        let page = 1;
        if (req.params.page) page = req.params.page;

        const itemsForPage = 5;

        // Calcular el total de publicaciones
        const total = await Publication.countDocuments({ "user": userId });

        // Find, populate, ordenar, (paginación)
        const publications = await Publication.find({ "user": userId })
            .sort("-created_at")
            .populate('user', '-password -__v -rol -email')
            .skip((page - 1) * itemsForPage)
            .limit(itemsForPage)
            .lean();

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Publicaciones del perfil de un usuario",
            total,
            pages: Math.ceil(total / itemsForPage),
            currentPage: page,
            publications
        });
    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "No hay publicaciones para mostrar",
        });
    }
};

//Subir ficheros
const upload = async (req, res) => {
    // Obtener el ide de la publicacion (publicationId)
    const publicationId = req.params.id;

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
        const publicationUpdated = await Publication.findOneAndUpdate(
            { "user": req.user.id, "_id": publicationId },
            { file: req.file.filename },
            { new: true }
        );

        if (!publicationUpdated) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida de la imagen"
            });
        }

        // Devolver respuesta si la actualización fue exitosa
        return res.status(200).send({
            status: "success",
            publication: publicationUpdated,
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

//Devolver archivos multimedia -> imagenes (futuro-> videos)
const media = (req, res) => {
    // Sacar el parametro de la URL
    const file = req.params.file;

    // Escribir el path real de la imagen
    const filePath = "./uploads/publications/"+file;

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

//Listar todas las publicaciones(feed)
const feed = async (req, res) => {
    // Obtener la página actual
    let page = 1;

    if(req.params.page){
        page = req.params.page;
    }

    // Establecer numero de elementos por página
    const itemsForPage = 5;

    // Sacar un array de identificadores de usuarios que yo sigo como usuario logueado
    try{
        const myFollows = await followService.followUserIds(req.user.id);

        // Contar el total de documentos
        const total = await Publication.countDocuments({ user: { $in: myFollows.following } });

        // Find a publicaciones in, ordenar, populate y paginar
        const publications = await Publication.find({ user: { $in: myFollows.following } })
            .sort("-created_at")
            .populate("user", "-password -rol -__v -email")
            .skip((page - 1) * itemsForPage)
            .limit(itemsForPage)
            .lean(); // obtiene objetos JSON simples

        // Devolver respuesta
        return res.status(200).send({
            status: "success", 
            message: "Feed de publicaciones",
            following: myFollows.following,
            total,
            pages: Math.ceil(total / itemsForPage),
            currentPage: page,
            publications
        });

    }catch(error){

        // Find a publicaciones in, ordenar, populate y paginar

        return res.status(500).send({
            status: "error", 
            message: "No se han listado las publicaciones del feed"
        });
    }
}


//Exportar acciones
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}