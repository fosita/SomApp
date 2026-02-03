const repository = require('../../infrastructure/repositories/appointment.methods.repository.cjs');
module.exports = {
    async findAll(req, res) {
        try {
            const methods = await repository.findAll();
            res.status(200).json(methods);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async findById(req, res) {
        try {
            const { methodId } = req.params;
            const methods = await repository.findById(methodId);
            res.status(200).json(methods);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};