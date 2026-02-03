const db = require('../sequelize.cjs');


module.exports = {
    async findById(id) {
        return await db.AllergiesPerPatient.findByPk(id);
    },
    async findByAllergyId(allergyId) {
        return await db.AllergiesPerPatient.findAll({ where: { allergyId } });
    },

    async findByPatientId(patientId) {
        return await db.AllergiesPerPatient.findAll({ where: { patientId } });
    },
    async create(patientId, allergyId) {
        return await db.AllergiesPerPatient.create({ patientId, allergyId });
    },
    async delete(allergyId, patientId) {
        return await db.AllergiesPerPatient.destroy({ where: { patientId, allergyId }, force: true });
    }
};