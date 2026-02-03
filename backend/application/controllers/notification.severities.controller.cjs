const repository = require('../../infrastructure/repositories/notification.severities.repository.cjs');

module.exports = {
    async findAll(req, res) {
        try {
            const severities = await repository.findAll();
            res.status(200).json(severities);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findById(req, res) {
        try {
            const { severityId } = req.params;
            const severity = await repository.findById(severityId);
            res.status(200).json(severity);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};