const repository = require('../../infrastructure/repositories/conditions.per.patient.repository.cjs');
module.exports = {
    async create(req, res) {
        try {
            const { patientId, conditionId } = req.body;
            const createdCPP = await repository.create(patientId, conditionId);
            res.status(201).json(createdCPP);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async delete(req, res) {
        try {
            const { patientId, conditionId } = req.params;
            const deletedCPP = await repository.delete(Number(patientId), Number(conditionId));
            res.status(200).json(deletedCPP);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async findByPatientId(req, res) {
        try {
            const { patientId } = req.params;
            const conditions = await repository.findByPatientId(patientId);
            res.status(200).json(conditions);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async findByConditionId(req, res) {
        try {
            const { conditionId } = req.params;
            const conditions = await repository.findByConditionId(conditionId);
            res.status(200).json(conditions);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const conditionPerPatient = await repository.findById(id);
            res.status(200).json(conditionPerPatient);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};