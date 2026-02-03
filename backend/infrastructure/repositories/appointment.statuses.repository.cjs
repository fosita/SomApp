const db = require('../sequelize.cjs');


module.exports = {
    async findAll() { return await db.AppointmentStatuses.findAll(); },
    async findById(id) { return await db.AppointmentStatuses.findByPk(id); }
};