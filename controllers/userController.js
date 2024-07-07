const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;

const loginUser = (req, res) => {
    const { username, password } = req.body;

    userModel.getUserByUsername(username, async (err, user) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send({ error: 'Error fetching user' });
        }
        if (!user) {
            return res.status(400).send({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).send({ error: 'Invalid credentials' });
        }

        const accessToken = jwt.sign({ id: user.id_usuario, role: user.rol }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1h',
        });
        res.status(200).send({ accessToken });
    });
};

const getUserInfo = (req, res) => {
    const userId = req.user.id;

    userModel.getUserById(userId, (err, user) => {
        if (err) {
            console.error('Error fetching user info:', err);
            return res.status(500).send({ error: 'Error fetching user info' });
        }
        res.status(200).send(user);
    });
};

const createUser = async (req, res) => {
    let userData = req.body;
    try {
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
        userData.password = hashedPassword;

        userModel.createUser(userData, (err, results) => {
            if (err) {
                res.status(500).send({ error: 'Error al registrar al pasante' });
            } else {
                res.status(201).send({ message: 'Pasante registrado exitosamente', userId: results.insertId });
            }
        });
    } catch (error) {
        res.status(500).send({ error: 'Error hashing password' });
    }
};

const getPasantes = (req, res) => {
    userModel.getPasantes((err, results) => {
        if (err) {
            return res.status(500).send({ error: 'Error fetching pasantes' });
        }
        res.status(200).send(results);
    });
};

const getPasanteById = (req, res) => {
    const id = req.params.id;
    userModel.getPasanteById(id, (err, results) => {
        if (err) {
            return res.status(500).send({ error: 'Error fetching pasante' });
        }
        res.status(200).send(results[0]);
    });
};

const updatePasante = async (req, res) => {
    const id = req.params.id;
    const pasanteData = req.body;

    if (pasanteData.password) {
        try {
            const hashedPassword = await bcrypt.hash(pasanteData.password, 10);
            pasanteData.password = hashedPassword;
        } catch (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send({ error: 'Error hashing password' });
        }
    } else {
        delete pasanteData.password;
    }

    userModel.updatePasante(id, pasanteData, (err, results) => {
        if (err) {
            console.error('Error updating pasante:', err);
            return res.status(500).send({ error: 'Error updating pasante' });
        }
        res.status(200).send({ message: 'Pasante updated successfully' });
    });
};

const updateUserProfile = (req, res) => {
    const userId = req.params.id;
    const { nombre, direccion, ci, numero } = req.body;

    userModel.updateUserProfile(userId, { nombre, direccion, ci, numero }, (err, result) => {
        if (err) {
            console.error('Error updating profile:', err);
            return res.status(500).send({ error: 'Error updating profile' });
        }
        res.status(200).send({ message: 'Profile updated successfully' });
    });
};

const updateUserPassword = (req, res) => {
    const userId = req.params.id;
    const { passwordAnterior, nuevaPassword } = req.body;

    userModel.getUserById(userId, async (err, user) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send({ error: 'Error fetching user' });
        }

        // Verifica si `user` es válido y contiene la propiedad `password`
        if (!user || !user.password) {
            console.error('User or password not found:', user);
            return res.status(400).send({ error: 'Invalid user or password' });
        }

        try {
            const validPassword = await bcrypt.compare(passwordAnterior, user.password);
            if (!validPassword) {
                return res.status(400).send({ error: 'Invalid current password' });
            }
            
            const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
            userModel.updateUserPassword(userId, hashedPassword, (err, result) => {
                if (err) {
                    console.error('Error updating password:', err);
                    return res.status(500).send({ error: 'Error updating password' });
                }
                res.status(200).send({ message: 'Password updated successfully' });
            });
        } catch (error) {
            console.error('Error during password comparison:', error);
            return res.status(500).send({ error: 'Error during password comparison' });
        }
    });
};

const getAtencionesUsuario = (req, res) => {  
    if (req.user.role === 'supervisor') {
        userModel.getTodasAtenciones((err, atenciones) => {
            if(err){
                return res.status(500).send({ error: 'Error fetching atenciones' });
            }
            res.status(200).send(atenciones);
        })
    } else {
        userModel.getAtencionesUsuario(req.user.id, (err, atenciones) => {
            if(err){
                return res.status(500).send({ error: 'Error fetching atenciones' });
            }
            res.status(200).send(atenciones);
        })
    }
}

const getPendientesUsuario = (req, res) => {  
    if (req.user.role === 'supervisor') {
        userModel.getTotalPendientes((err, atenciones) => {
            if(err){
                return res.status(500).send({ error: 'Error fetching atenciones' });
            }
            res.status(200).send(atenciones);
        })
    } else {
        userModel.getPendientesUsuario(req.user.id, (err, atenciones) => {
            if(err){
                return res.status(500).send({ error: 'Error fetching atenciones' });
            }
            res.status(200).send(atenciones);
        })
    }
}

const getSolucionesMes = (req, res) => {  
    if (req.user.role === 'supervisor') {
        userModel.getTotalCasosSolucionadosMes((err, atenciones) => {
            if(err){
                return res.status(500).send({ error: 'Error fetching atenciones' });
            }
            res.status(200).send(atenciones);
        })
    } else {
        userModel.getCasosSolucionadosMesPasante(req.user.id, (err, atenciones) => {
            if(err){
                return res.status(500).send({ error: 'Error fetching atenciones' });
            }
            res.status(200).send(atenciones);
        })
    }
}

const getPendientesMes = (req, res) => {  
    if (req.user.role === 'supervisor') {
        userModel.getTotalCasosPendientesMes((err, atenciones) => {
            if(err){
                return res.status(500).send({ error: 'Error fetching atenciones' });
            }
            res.status(200).send(atenciones);
        })
    } else {
        userModel.getCasosPendientesMesPasante(req.user.id, (err, atenciones) => {
            if(err){
                return res.status(500).send({ error: 'Error fetching atenciones' });
            }
            res.status(200).send(atenciones);
        })
    }
}

const getTotalAtencionesMes = (req, res) => {  
    if (req.user.role === 'supervisor') {
        userModel.getAtencionesMesTotal((err, atenciones) => {
            if(err){
                return res.status(500).send({ error: 'Error fetching atenciones' });
            }
            res.status(200).send(atenciones);
        })
    } else {
        userModel.getAtencionesMesPasante(req.user.id, (err, atenciones) => {
            if(err){
                return res.status(500).send({ error: 'Error fetching atenciones' });
            }
            res.status(200).send(atenciones);
        })
    }
}

const getTotalPlanillas = (req, res) => {  
    if (req.user.role === 'supervisor') {
        userModel.getPlanillas((err, atenciones) => {
            if(err){
                return res.status(500).send({ error: 'Error fetching atenciones' });
            }
            res.status(200).send(atenciones);
        })
    } else {
        userModel.getPlanillasPasante(req.user.id, (err, atenciones) => {
            if(err){
                return res.status(500).send({ error: 'Error fetching atenciones' });
            }
            res.status(200).send(atenciones);
        })
    }
}

const getTotalRoe = (req, res) => {  
    if (req.user.role === 'supervisor') {
        userModel.getRoe((err, atenciones) => {
            if(err){
                return res.status(500).send({ error: 'Error fetching atenciones' });
            }
            res.status(200).send(atenciones);
        })
    } else {
        userModel.getRoePasante(req.user.id, (err, atenciones) => {
            if(err){
                return res.status(500).send({ error: 'Error fetching atenciones' });
            }
            res.status(200).send(atenciones);
        })
    }
}

const getTotalTrabajadores = (req, res) => {  
    if (req.user.role === 'supervisor') {
        userModel.getTrabajadores((err, atenciones) => {
            if(err){
                return res.status(500).send({ error: 'Error fetching atenciones' });
            }
            res.status(200).send(atenciones);
        })
    } else {
        userModel.getTrabajadoresPasante(req.user.id, (err, atenciones) => {
            if(err){
                return res.status(500).send({ error: 'Error fetching atenciones' });
            }
            res.status(200).send(atenciones);
        })
    }
}

module.exports = {
    loginUser,
    getUserInfo,
    createUser,
    getPasantes,
    getPasanteById,
    updatePasante,
    updateUserProfile,
    updateUserPassword,
    getAtencionesUsuario,
    getPendientesUsuario,
    getSolucionesMes,
    getPendientesMes,
    getTotalAtencionesMes,
    getTotalPlanillas,
    getTotalRoe,
    getTotalTrabajadores
};