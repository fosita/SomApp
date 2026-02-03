const db = require('../sequelize.cjs');


module.exports = {
    async findAll() {
        return await db.Universities.findAll();
    },
    async findById(id) {
        return await db.Universities.findByPk(id);
    }
};