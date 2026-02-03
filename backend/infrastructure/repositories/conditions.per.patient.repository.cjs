const db = require('../sequelize.cjs');


module.exports = {
    async findById(id) {
        return await db.ConditionsPerPatient.findByPk(id);
    },
    async findByConditionId(conditionId) {
        return await db.ConditionsPerPatient.findAll({ where: { conditionId } });
    },
    async findByPatientId(patientId) {
        return await db.ConditionsPerPatient.findAll({ where: { patientId } });
    },
    async create(patientId, conditionId) {
        return await db.ConditionsPerPatient.create({ patientId, conditionId });
    },
    async delete(patientId, conditionId) {
        return await db.ConditionsPerPatient.destroy({ where: { patientId, conditionId }, force: true });
    }
};