const atencionModel = require('../models/atencionModel');

const createAtencion = (req, res) => {
    const id_usuario = req.user.id;
    const atencionData = { ...req.body, id_usuario };

    atencionModel.createAtencion(atencionData, (err, results) => {
        if (err) {
            console.error('Error creating atencion:', err);
            return res.status(500).send({ error: 'Error creating atencion' });
        }
        res.status(201).send({ message: 'Atencion created successfully', atencionId: results.insertId });
    });
};

const getAtencionesByUser = (req, res) => {
    const userId = req.user.id;

    atencionModel.getAtencionesByUserId(userId, (err, atenciones) => {
        if (err) {
            return res.status(500).send({ error: 'Error fetching atenciones' });
        }
        res.send(atenciones);
    });
};

const updateAtencion = (req, res) => {
    const id = req.params.id;
    const atencionData = req.body;

    atencionModel.updateAtencion(id, atencionData, (err, result) => {
        if (err) {
            return res.status(500).send({ error: 'Error updating atencion' });
        }
        res.send({ message: 'Atencion updated successfully' });
    });
};
module.exports = {
    createAtencion,
    getAtencionesByUser,
    updateAtencion
};
