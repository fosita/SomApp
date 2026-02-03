const db = require('../sequelize.cjs');


module.exports = {
    async findAll() {
        return await db.Specialties.findAll();
    },
    async findById(id) {
        return await db.Specialties.findByPk(id);
    }
};