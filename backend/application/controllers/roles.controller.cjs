const repository = require('../../infrastructure/repositories/roles.repository.cjs');

module.exports = {
    async findAll(req, res) {
        try {
            const roles = await repository.findAll();
            res.status(200).json(roles);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findById(req, res) {
        try {
            const { roleId } = req.params;
            const role = await repository.findById(roleId);
            res.status(200).json(role);
        } catch (err) { res.status(500).json({ error: err.message }) }
    }
};