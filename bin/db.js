// db.js
const mysql = require('mysql2'); // Or your chosen database driver

let connection = null; // This variable is 'closed over'

function createDbConnection() {
    if (!connection) {
        connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '12345',
            database: 'cs208demo'
        });

        connection.connect(err => {
            if (err) {
                console.error('Error connecting to database:', err);
                // Handle error appropriately, e.g., exit process
            } else {
                console.log('Database connected!');
            }
        });
    }
    console.log('Using existing database connection');
    return connection;
}

// Middleware to attach the connection to the request object
function dbMiddleware(req, res, next) {
    req.db = createDbConnection();
    console.log(`DB middleware id: ${req.db.threadId}, called at: ${Date.now()}`);
    next();
}

// Function to close the connection (for graceful shutdown)
function closeDbConnection() {
    if (connection) {
        connection.end(err => {
            if (err) {
                console.error('Error closing database connection:', err);
            } else {
                console.log('Database connection closed.');
                connection = null; // Reset connection
            }
        });
    }
}

module.exports = { dbMiddleware, createDbConnection, closeDbConnection };