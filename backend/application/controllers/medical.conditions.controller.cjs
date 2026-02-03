const repository = require('../../infrastructure/repositories/conditions.repository.cjs');
module.exports = {
    async create(req, res) {
        try {
            const { creatorId, name, description } = req.body;
            const createdCondition = await repository.create(creatorId, name, description);
            res.status(201).json(createdCondition);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async update(req, res) {
        const {id, creatorId, name, description} = req.body;
        try {
            const updatedCondition = await repository.update(id, creatorId, name, description);
            res.status(200).json(updatedCondition);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findAll(req, res) {
        try {
            const conditions = await repository.findAll();
            res.status(200).json(conditions);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findAllByCreatorId(req, res) {
        try {
            const { doctorId } = req.params;
            const conditions = await repository.findByCreatorId(Number(doctorId));
            res.status(200).json(conditions);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findById(req, res) {
        try {
            const { conditionId } = req.params;
            const condition = await repository.findById(Number(conditionId));
            res.status(200).json(condition);
        } catch (err) { res.status(500).json({ error: err.message }) }
    }

}