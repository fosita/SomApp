const repository = require('../../infrastructure/repositories/allergies.per.patient.repository.cjs');
module.exports = {
    async create(req, res) {
        try {
            const { patientId, allergyId } = req.body;
            const createdAPP = await repository.create(patientId, allergyId);
            res.status(201).json(createdAPP);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async delete(req, res) {
        try {
            const { patientId, allergyId } = req.params;
            const deletedAPP = await repository.delete(Number(allergyId), Number(patientId));
            res.status(200).json(deletedAPP);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findByPatientId(req, res) {
        try {
            const { patientId } = req.params;
            const allergies = await repository.findByPatientId(Number(patientId));
            res.status(200).json(allergies);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findByAllergyId(req, res) {
        try {
            const { allergiesId } = req.params;
            const allergies = await repository.findByAllergyId(Number(allergiesId));
            res.status(200).json(allergies);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findById(req, res) {
        try {
            const { id } = req.params;
            const allergyPerPatient = await repository.findById(id);
            res.status(200).json(allergyPerPatient);
        } catch (err) { res.status(500).json({ error: err.message }) }
    }
};