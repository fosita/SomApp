const db = require('../sequelize.cjs');
module.exports = {
    async findAll() { return await db.NotificationSeverities.findAll() },
    async findById(id) { return await db.NotificationSeverities.findByPk(id) }
};