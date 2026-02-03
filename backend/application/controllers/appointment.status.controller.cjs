const repository = require('../../infrastructure/repositories/appointment.statuses.repository.cjs');
module.exports = {
    async findAll(req, res) {
        try {
            const statuses = await repository.findAll();
            res.status(200).json(statuses);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async findById(req, res) {
        try {
            const { statusId } = req.params;
            const status = await repository.findById(statusId);
            res.status(200).json(status);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};