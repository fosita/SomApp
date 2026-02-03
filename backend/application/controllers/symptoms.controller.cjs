const repository = require('../../infrastructure/repositories/symptoms.repository.cjs');

module.exports = {
    async create(req, res) {
        try {
            const { creatorId, name, description, severity } = req.body;
            if (!creatorId || isNaN(Number(creatorId)))
                return res.status(400).json({ error: 'ID de creador inválido' });
            if (!name || !description || severity == null)
                return res.status(400).json({ error: 'Faltan campos obligatorios' });

            const createdSymptom = await repository.create(Number(creatorId), name, description, severity);
            res.status(201).json(createdSymptom);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async update(req, res) {
        try {
            const { id, creatorId, name, description, severity } = req.body;
            if (!id || !creatorId || isNaN(Number(id)) || isNaN(Number(creatorId)))
                return res.status(400).json({ error: 'IDs inválidos' });
            if (!name || !description || severity == null)
                return res.status(400).json({ error: 'Faltan campos para actualizar' });

            const updatedSymptom = await repository.update(Number(id), Number(creatorId), name, description, severity);
            res.status(200).json(updatedSymptom);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findAll(req, res) {
        try {
            const symptoms = await repository.findAll();
            res.status(200).json(symptoms);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findAllByCreatorId(req, res) {
        try {
            const { creatorId } = req.params;
            if (!creatorId || isNaN(Number(creatorId)))
                return res.status(400).json({ error: 'ID de creador inválido' });

            const symptoms = await repository.findByCreatorId(Number(creatorId));
            res.status(200).json(symptoms);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id)))
                return res.status(400).json({ error: 'ID inválido' });

            const symptom = await repository.findById(Number(id));
            res.status(200).json(symptom);
        } catch (err) { res.status(500).json({ error: err.message }) }
    }
};