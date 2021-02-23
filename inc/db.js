const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '#',
    user: '#',
    password: '#',
    database: '#',
    multipleStatements: true
});

module.exports = connection;