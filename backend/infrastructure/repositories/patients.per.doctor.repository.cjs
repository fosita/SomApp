const db = require('../sequelize.cjs');
const logger = require('../../shared/utils/logger.util.cjs');
module.exports = {
    async findDoctorsByPatientId(patientId) {
        const doctorIds = await db.PatientsPerDoctor.findAll(
            { where: { patientId }, raw: true });
        const ids = doctorIds.map(record => record.doctorId);
        return await db.Users.findAll({ where: { id: ids }, raw: true });
    },
    async findPatientsByDoctorId(doctorId) {
        const patientIds = await db.PatientsPerDoctor.findAll(
            { where: { doctorId }, raw: true });
        const ids = patientIds.map(record => record.patientId);
        return await db.Users.findAll({ where: { id: ids }, raw: true });
    },

    async linkPatientToDoctor(patientId, doctorId) {
        try {
            const relation = await db.PatientsPerDoctor.findOrCreate(
                { where: { patientId, doctorId } })
            if (!relation.active) {
                relation.active = true;
                await relation.save();
            }
            if (relation) return relation;
            return false;
        } catch (error) {
            logger.error("Error unlinking patient from doctor:", error);
            return false;
        }
    },
    async unlinkPatientFromDoctor(patientId, doctorId) {
        try {
            const relation = await db.PatientsPerDoctor.findAll(
                { where: { patientId, doctorId } })
            if(relation && relation.length){
                relation[0].active = false;
                await relation[0].save();
                return true;
            }
            return false;
        } catch (error) {
            logger.error("Error unlinking patient from doctor:", error);
            return false;
        }
    }
};