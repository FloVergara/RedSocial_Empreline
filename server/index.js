// Dependencias 
const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");

// Mensaje bienvenida
console.log("API red social EMPRELINE inicializada");

// Conexión a bd
connection();

// Crear servidor
const app = express();
const puerto = 3100;

// Configuracion cors
app.use(cors());

// Convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Cargar configuraciones rutas
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");

app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);

//Ruta de prueba
app.get('/prueba', (req,res) => {

    return res.status(200).json(
        {
            "id": 1,
            "nombre": "florencia",
            "email": "florencia.vergara@davinci.edu.ar"
        }
    );
})

// Servidor escucha peticiones http
app.listen(puerto, () => {
    console.log("Servidor corriendo en el puerto: ", puerto);
})