const db = require('../sequelize.cjs');

module.exports = {
    async findByPatientId(patientId) {
        return await db.Predictions.findAll({ where: { patientId }, raw: true });
    },

    async findByPatientIdAndDate(patientId, date) {
        const predictionData = await db.Predictions.findAll({ where: { patientId, date }, raw: true });
        return predictionData?.[0] || null;
    },

    async updateOrCreate(predictionData) {
        const existing = await db.Predictions.findByPk(predictionData.id);
        if (!existing) return db.Predictions.create(predictionData);
        Object.assign(existing, predictionData);
        return existing.save();
    }
};