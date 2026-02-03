const db = require('../sequelize.cjs');


module.exports = {
    async findAll() {
        return await db.AppointmentMethods.findAll();
    },
    async findById(id) {
        return await db.AppointmentMethods.findByPk(id);
    }
};