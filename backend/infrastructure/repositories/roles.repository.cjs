const db = require('../sequelize.cjs');
module.exports = {
    async findAll() { return await db.Roles.findAll() },
    async findById(id) { return await db.Roles.findByPk(id) }
};