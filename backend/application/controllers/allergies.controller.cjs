const repository = require('../../infrastructure/repositories/allergies.repository.cjs');
module.exports = {
    async create(req, res) {
        try {
            const { creatorId, name, description } = req.body;
            const createdAllergy = await repository.create(creatorId, name, description);
            res.status(201).json(createdAllergy);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async update(req, res) {
        const {id, creatorId, name, description} = req.body;
        try {
            const updatedAllergy = await repository.update(id, creatorId, name, description);
            res.status(200).json(updatedAllergy);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async findAll(req, res) {
        try {
            const allergies = await repository.findAll();
            res.status(200).json(allergies);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async findAllByCreatorId(req, res) {
        try {
            const { doctorId } = req.params;
            const allergies = await repository.findByCreatorId(Number(doctorId));
            res.status(200).json(allergies);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async findById(req, res) {
        try {
            const { allergiesId } = req.params;
            const allergy = await repository.findById(Number(allergiesId));
            res.status(200).json(allergy);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};