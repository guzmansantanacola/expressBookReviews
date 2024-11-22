const express = require('express');
let books = require("./booksdb.js"); // Datos locales
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Registro de usuario
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Both username and password are required." });
    }

    if (users[username]) {
        return res.status(400).json({ message: "Username already exists." });
    }

    users[username] = { username, password };
    return res.status(200).json({ message: `User ${username} registered successfully.` });
});

// Obtener la lista de libros disponibles en la tienda
public_users.get('/', async function (req, res) {
    try {
        // Trabajamos con datos locales
        const booksList = books;
        return res.status(200).send(JSON.stringify(booksList, null, 2)); // Formateo para legibilidad
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books list", error: error.message });
    }
});

// Obtener detalles del libro por ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        // Buscar libro por ISBN en el objeto `books`
        const book = books[isbn];

        if (book) {
            return res.status(200).json(book);
        } else {
            return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
        }
    } catch (error) {
        return res.status(500).json({ message: `Error fetching book with ISBN ${isbn}`, error: error.message });
    }
});

// Obtener detalles del libro basado en el autor
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        // Filtrar los libros por autor
        const booksByAuthor = Object.values(books).filter(book => book.author === author);

        if (booksByAuthor.length > 0) {
            return res.status(200).json(booksByAuthor);
        } else {
            return res.status(404).json({ message: `No books found for author ${author}.` });
        }
    } catch (error) {
        return res.status(500).json({ message: `Error fetching books by author ${author}`, error: error.message });
    }
});

// Obtener todos los libros basados en el título
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;

    try {
        // Filtrar los libros por título
        const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());

        if (booksByTitle.length > 0) {
            return res.status(200).json(booksByTitle);
        } else {
            return res.status(404).json({ message: `No books found with title ${title}.` });
        }
    } catch (error) {
        return res.status(500).json({ message: `Error fetching books with title ${title}`, error: error.message });
    }
});

// Obtener reseñas de un libro basado en ISBN
public_users.get('/review/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        // Buscar libro por ISBN
        const book = books[isbn];

        if (book && book.reviews) {
            if (Object.keys(book.reviews).length > 0) {
                return res.status(200).json(book.reviews);
            } else {
                return res.status(404).json({ message: `No reviews found for ISBN ${isbn}.` });
            }
        } else {
            return res.status(404).json({ message: `No book found with ISBN ${isbn}.` });
        }
    } catch (error) {
        return res.status(500).json({ message: `Error fetching reviews for ISBN ${isbn}`, error: error.message });
    }
});

module.exports.general = public_users;
