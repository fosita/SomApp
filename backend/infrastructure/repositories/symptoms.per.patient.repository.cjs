const db = require('../sequelize.cjs');


module.exports = {
    async findById(id) {  return await db.SymptomsPerPatient.findByPk(id) },
    async findByPatientId(patientId) {
        return await db.SymptomsPerPatient.findAll({ where: { patientId }, raw: true });
    },
    async findBySymptomId(riskFactorId) {
        return await db.SymptomsPerPatient.findAll({ where: { riskFactorId }, raw: true });
    },
    async getSymptomScorePerPatient(patientId) {
        const rows = await db.SymptomsPerPatient.findAll({
            where: { patientId }, raw: true, nest: true,
            include: [{ model: db.Symptoms, as: 'symptom', attributes: ['severity'] }],
        });
        if(!rows || !rows.length) return 0;
        if(!rows[0].symptom.severity) return 0;
        // Sumatoria de riesgos
        return rows.reduce((t, r) =>
            t < r.symptom.severity ? r.symptom.severity : t, 0);
        // rows.reduce((t, r)=> t + r.symptom.severity, 0);
    },
    async create(patientId, symptomId) {
        return await db.SymptomsPerPatient.create({ patientId, symptomId });
    },
    async delete(symptomId, patientId) {
        return await db.SymptomsPerPatient.destroy({ where: { patientId, symptomId }, force: true });
    }
};