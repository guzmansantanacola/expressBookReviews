const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { username: 'testUser1', password: 'password1' },
    { username: 'testUser2', password: 'password2' }
];

// Función para verificar si el username es válido
const isValid = (username) => {
    return users.some(user => user.username === username);
}

// Función para verificar si el username y password coinciden
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username && user.password === password);
    return user ? true : false;
}

// Iniciar sesión (Login) - Devuelve un JWT si las credenciales son correctas
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Verifica si el username y password están presentes
    if (!username || !password) {
        return res.status(400).json({ message: "Both username and password are required." });
    }

    // Verifica si las credenciales son correctas
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password." });
    }

    // Genera un JWT con el username
    const token = jwt.sign({ username: username }, 'your_secret_key', { expiresIn: '1h' });

    // Envía el token al cliente
    res.status(200).json({
        message: "Login successful",
        token: token
    });
});

// Agregar o modificar una reseña del libro (requiere autenticación)
regd_users.put("/auth/review/:isbn", (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1]; // 'Bearer <token>'
    
    if (!token) {
        return res.status(403).json({ message: "No token provided. Authentication required." });
    }

    // Verifica y decodifica el token
    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token." });
        }

        // Obtiene el ISBN y la reseña desde los parámetros y la query
        const { isbn } = req.params;
        const { review } = req.query; // La reseña es pasada como parámetro query

        if (!review) {
            return res.status(400).json({ message: "Review content is required." });
        }

        // Verifica si el libro existe
        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found." });
        }

        // Verifica si el usuario ya ha dejado una reseña para este libro
        if (books[isbn].reviews && books[isbn].reviews[decoded.username]) {
            // Si ya existe una reseña, la modifica
            books[isbn].reviews[decoded.username] = review;
            return res.status(200).json({ message: "Review updated successfully." });
        } else {
            // Si no existe una reseña, la agrega
            if (!books[isbn].reviews) {
                books[isbn].reviews = {}; // Inicializa el objeto de reseñas si no existe
            }
            books[isbn].reviews[decoded.username] = review;
            return res.status(200).json({ message: "Review added successfully." });
        }
    });
    regd_users.delete("/auth/review/:isbn", (req, res) => {
        const token = req.headers['authorization']?.split(' ')[1]; // 'Bearer <token>'
    
        if (!token) {
            return res.status(403).json({ message: "No token provided. Authentication required." });
        }
    
        // Verifica y decodifica el token
        jwt.verify(token, 'your_secret_key', (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Invalid or expired token." });
            }
    
            console.log('Decoded Token:', decoded); // Verifica el contenido del token decodificado
    
            const { isbn } = req.params;
    
            // Verifica si el libro existe
            if (!books[isbn]) {
                return res.status(404).json({ message: "Book not found." });
            }
    
            // Verifica si el usuario ha dejado una reseña para este libro
            if (books[isbn].reviews && books[isbn].reviews[decoded.username]) {
                // Si el usuario tiene una reseña, la elimina
                delete books[isbn].reviews[decoded.username];
                return res.status(200).json({ message: "Review deleted successfully." });
            } else {
                return res.status(404).json({ message: "Review not found." });
            }
        });
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
