const db = require('../sequelize.cjs');


module.exports = {
    async findByDoctorId(doctorId) {
        return await db.Notifications.findAll({ where: { doctorId } });
    },
    async findByPatientId(patientId) {
        return await db.Notifications.findAll({ where: { patientId } });
    },
    async findNotShownByPatientId(patientId) {
        return await db.Notifications.findAll({ where: { patientId, shown: false } });
    },
    async findByPatientIdAndDoctorId(patientId, doctorId) {
        return await db.Notifications.findAll({ where: { patientId, doctorId } });
    },
    async findById(id) {
        return await db.Notifications.findByPk(id);
    },
    async create(patientId, doctorId, summary, detail, severityId) {
        return await db.Notifications.create({ patientId, doctorId, summary, detail, severityId, shown: false });
    },
    async deleteForUser(id) {
        const notification = await db.Notifications.findByPk(id);
        if (!notification)  return false;

        notification.deleted = true;
        await notification.save();
        return true;
    },
    async delete(id) {
        const notification = await db.Notifications.findByPk(id);
        if (!notification) return false;
        await notification.destroy();
        return true;
    },
    async markAsShown(id) {
        const notification = await db.Notifications.findByPk(id);
        if (notification) {
            notification.shown = true;
            await notification.save();
        }
        return notification;
    },
    async update(id, summary, detail, severityId) {
        const notification = await db.Notifications.findByPk(id);
        if (notification) {
            notification.summary = summary;
            notification.detail = detail;
            notification.severityId = severityId
            await notification.save();
        }
        return notification;
    }
};