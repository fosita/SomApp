const repository = require('../../infrastructure/repositories/risks.per.patient.repository.cjs');
module.exports = {
    async create(req, res) {
        try {
            const { patientId, riskId } = req.body;
            const createdRPP = await repository.create(patientId, riskId);
            res.status(201).json(createdRPP);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async delete(req, res) {
        try {
            const { patientId, riskId } = req.params;
            const deletedRPP = await repository.delete(Number(riskId), Number(patientId));
            res.status(200).json(deletedRPP);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findByPatientId(req, res) {
        try {
            const { patientId } = req.params;
            const risks = await repository.findByPatientId(Number(patientId));
            res.status(200).json(risks);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findByRiskId(req, res) {
        try {
            const { riskId } = req.params;
            const patients = await repository.findByRiskId(Number(riskId));
            res.status(200).json(patients);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const RPP = await repository.findById(id);
            res.status(200).json(RPP);
        } catch (err) { res.status(500).json({ error: err.message }) }
    }
};