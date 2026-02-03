const repository = require('../../infrastructure/repositories/specialties.repository.cjs');

module.exports = {
    async findAll(req, res) {
        try {
            const specialities = await repository.findAll();
            res.status(200).json(specialities);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async findById(req, res) {
        try {
            const { specialityId } = req.params;
            const speciality = await repository.findById(specialityId);
            res.status(200).json(speciality);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};