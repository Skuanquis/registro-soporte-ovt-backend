const db = require('../db/db');

const getUserByUsername = (username, callback) => {
    const sql = `SELECT * FROM usuarios WHERE username = ?`;
    db.query(sql, [username], (err, results) => {
        if (err) return callback(err);
        return callback(null, results[0]);
    });
};

const getUserById = (id, callback) => {
    const query = 'SELECT * FROM usuarios WHERE id_usuario = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        if (results.length === 0) {
            return callback(new Error('User not found'), null);
        }
        return callback(null, results[0]);
    });
};

const createUser =(userData, callback) =>{
    const {nombre, direccion, ci, numero, username,password, rol} = userData;
    const sql = 'INSERT INTO usuarios (nombre, direccion, ci, numero, username, password, rol) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [nombre, direccion, ci, numero, username,password, rol], callback);
};

const getPasantes = (callback) => {
    const sql = `
        SELECT u.id_usuario, u.nombre, u.ci, u.numero AS celular, COUNT(a.id_atencion) AS casos
        FROM usuarios u
        LEFT JOIN atencion a ON u.id_usuario = a.id_usuario
        WHERE u.rol = 'pasante'
        GROUP BY u.id_usuario, u.nombre, u.ci, u.numero
    `;
    db.query(sql, callback);
};

const getPasanteById = (id, callback) => {
    const sql = `SELECT * FROM usuarios WHERE id_usuario = ? AND rol = 'pasante'`;
    db.query(sql, [id], callback);
};

const updatePasante = (id, pasanteData, callback) => {
    const { nombre, direccion, ci, numero, password } = pasanteData;
    const sql = password 
        ? `UPDATE usuarios SET nombre = ?, direccion = ?, ci = ?, numero = ?, password = ? WHERE id_usuario = ? AND rol = 'pasante'`
        : `UPDATE usuarios SET nombre = ?, direccion = ?, ci = ?, numero = ? WHERE id_usuario = ? AND rol = 'pasante'`;
    const params = password ? [nombre, direccion, ci, numero, password, id] : [nombre, direccion, ci, numero, id];
    db.query(sql, params, callback);
};

const updateUserProfile = (id, userData, callback) => {
    const query = 'UPDATE usuarios SET nombre = ?, direccion = ?, ci = ?, numero = ? WHERE id_usuario = ?';
    const { nombre, direccion, ci, numero } = userData;
    db.query(query, [nombre, direccion, ci, numero, id], callback);
};

const updateUserPassword = (id, hashedPassword, callback) => {
    const query = 'UPDATE usuarios SET password = ? WHERE id_usuario = ?';
    db.query(query, [hashedPassword, id], callback);
};

module.exports = {
    getUserByUsername,
    getUserById,
    createUser,
    getPasantes,
    getPasanteById,
    updatePasante,
    updateUserProfile,  
    updateUserPassword
};