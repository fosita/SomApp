const repository = require('../../infrastructure/repositories/risk.repository.cjs');
module.exports = {
    async create(req, res) {
        const { creatorId, name, description, risk } = req.body;
        try { res.status(201).json(await repository.create(creatorId, name, description, risk)) }
        catch (err) { res.status(500).json({ error: err.message }) }
    },

    async update(req, res) {
        const {id, creatorId, name, description, risk} = req.body;
        try { res.status(200).json(await repository.update(id, creatorId, name, description, risk)) }
        catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findAll(req, res) {
        try { res.status(200).json(await repository.findAll({ raw: true })) }
        catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findAllByCreatorId(req, res) {
        try {
            const { doctorId } = req.params;
            const risks = await repository.findByCreatorId(Number(doctorId));
            res.status(200).json(risks);
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