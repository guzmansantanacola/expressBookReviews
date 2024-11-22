const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Configurar la sesión para la ruta /customer
app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Middleware para autenticar rutas bajo /customer/auth/*
app.use("/customer/auth/*", function auth(req, res, next) {
    // Verificar si la sesión contiene un token de acceso
    const token = req.session.accessToken;

    if (!token) {
        // Si no hay token, retornar un error de autenticación
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    try {
        // Verificar el token utilizando jwt
        const decoded = jwt.verify(token, "fingerprint_customer"); // Usa la misma clave secreta utilizada para generar el token
        req.user = decoded; // Guardar el payload decodificado en el objeto req para usarlo en rutas posteriores
        next(); // Llamar al siguiente middleware o ruta
    } catch (error) {
        // Manejar errores de verificación del token
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
});

// Definir los controladores de las rutas
const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

// Iniciar el servidor
app.listen(PORT, () => console.log("Server is running"));
