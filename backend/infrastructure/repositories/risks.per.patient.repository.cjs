const db = require('../sequelize.cjs');
module.exports = {
    async findById(id) {  return await db.RiskFactorsPerPatient.findByPk(id) },
    async findByPatientId(patientId) {
        return await db.RiskFactorsPerPatient.findAll({ where: { patientId }, raw: true });
    },
    async findByRiskId(riskFactorId) {
        return await db.RiskFactorsPerPatient.findAll({ where: { riskFactorId }, raw: true });
    },
    async getTotalRiskPerPatient(patientId) {
        const rows = await db.RiskFactorsPerPatient.findAll({
            where: { patientId }, raw: true, nest: true,
            include: [{ model: db.RiskFactors, as: 'risk', attributes: ['risk'] }],
        });
        if(!rows || !rows.length) return 0;
        if(!rows[0].risk) return 0;
        return rows.reduce((t, r) => t + r.risk.risk, 0);
    },
    async create(patientId, riskFactorId) {
        return await db.RiskFactorsPerPatient.create({ patientId, riskFactorId });
    },
    async delete(riskFactorId, patientId) {
        return await db.RiskFactorsPerPatient.destroy({ where: { patientId, riskFactorId }, force: true });
    }
};