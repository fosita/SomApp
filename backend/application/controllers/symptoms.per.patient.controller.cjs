const repository = require('../../infrastructure/repositories/symptoms.per.patient.repository.cjs');
module.exports = {
    async create(req, res) {
        try {
            const { patientId, symptomId } = req.params;
            const createdAPP = await repository.create(patientId, symptomId);
            res.status(201).json(createdAPP);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async delete(req, res) {
        try {
            const { patientId, symptomId } = req.params;
            const deletedAPP = await repository.delete(Number(symptomId), Number(patientId));
            res.status(200).json(deletedAPP);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findByPatientId(req, res) {
        try {
            const { patientId } = req.params;
            const symptoms = await repository.findByPatientId(Number(patientId));
            res.status(200).json(symptoms);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findBySymptomId(req, res) {
        try {
            const { symptomsId } = req.params;
            const symptoms = await repository.findBysymptomId(Number(symptomsId));
            res.status(200).json(symptoms);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const symptomPerPatient = await repository.findById(id);
            res.status(200).json(symptomPerPatient);
        } catch (err) { res.status(500).json({ error: err.message }) }
    }
};