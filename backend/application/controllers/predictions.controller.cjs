const repository = require('../../infrastructure/repositories/predictions.repository.cjs');
const patientRepo = require('../../infrastructure/repositories/user.repository.cjs');
const riskRepo = require('../../infrastructure/repositories/risks.per.patient.repository.cjs');
const symptomRepo = require('../../infrastructure/repositories/symptoms.per.patient.repository.cjs');
const paramsRepo = require('../../infrastructure/repositories/prediction.params.repository.cjs');
const appointmentRepo = require('../../infrastructure/repositories/appointments.repository.cjs');
const { predictRecurrence } = require("../../infrastructure/random.forest/random.forest.cjs");

const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

async function buildPredictionData(patientId) {
    const patient = await patientRepo.findById(patientId);
    const risk = await riskRepo.getTotalRiskPerPatient(patientId);
    const symptoms = await symptomRepo.getSymptomScorePerPatient(patientId);
    const paramsList = await paramsRepo.findByPatientId(patientId);
    const predictionParams = paramsList[-1] || {};

    console.log("Riesgo", risk)
    console.log("Sintomas", symptoms)
    console.log("Params", predictionParams)

    const appointments = await appointmentRepo.findAllByPatientId(patientId);
    const recentApps = appointments.filter(app => sixMonthsAgo < app.date && app.date <= new Date());
    const lastApp = recentApps.sort((a, b) => new Date(b.date) - new Date(a.date))[0] || null;

    const age = patient.birthdate
        ? Math.floor((Date.now() - new Date(patient.birthdate)) / (365.25 * 24 * 60 * 60 * 1000))
        : 50;

    return {
        patientId,
        age,
        weight: patient.weight || 0,
        height: patient.height || 0,
        risk: risk || 0,
        tumorSize: predictionParams.tumorSize || 0,
        lymphNodeCount: predictionParams.lymphNodeCount || 0,
        metastasis: predictionParams.metastasis || 0,
        ca153Marker: predictionParams.ca153Marker || 0,
        chemotherapy: predictionParams.chemotherapy || 0,
        chemoCycles: predictionParams.chemoCycles || 0,
        radiotherapy: predictionParams.radiotherapy || 0,
        surgery: predictionParams.surgery || 0,
        lastAppointmentDate: lastApp?.date || new Date(),
        datesCount: recentApps.length,
        symptoms: symptoms || 0,
    };
}

module.exports = {
    async create(req, res) {
        try {
            const patientId = Number(req.body.patientId);
            if (!patientId) return res.status(400).json({ error: "Id de paciente inválido" });

            const input = await buildPredictionData(patientId);
            const prediction = await predictRecurrence(input);
            const saved = await repository.updateOrCreate(prediction);

            res.status(201).json(saved);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async regenerate(req, res) {
        try {
            const patientId = Number(req.params.patientId);
            if (!patientId) return res.status(400).json({ error: "Id de paciente inválido" });

            const today = new Date();
            const existing = await repository.findByPatientIdAndDate(patientId, today);

            const input = await buildPredictionData(patientId);
            const prediction = await predictRecurrence(input);

            if (existing) prediction.id = existing.id;
            const saved = await repository.updateOrCreate(prediction);

            res.status(201).json(saved);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findByPatientId(req, res) {
        try {
            const patientId = Number(req.params.patientId);
            if (!patientId) return res.status(400).json({ error: "Id de paciente inválido" });

            const predictions = await repository.findByPatientId(patientId);
            res.status(200).json(predictions);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },
};
