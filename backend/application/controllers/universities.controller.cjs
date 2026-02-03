const repository = require('../../infrastructure/repositories/universities.repository.cjs');

module.exports = {
    async findAll(req, res) {
        try {
            const universities = await repository.findAll();
            res.status(200).json(universities);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async findById(req, res) {
        try {
            const { universityId } = req.params;
            const university = await repository.findById(universityId);
            res.status(200).json(university);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};