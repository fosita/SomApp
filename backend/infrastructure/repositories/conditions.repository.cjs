const db = require('../sequelize.cjs');


module.exports = {
    async findAll() {
        return await db.MedicalConditions.findAll();
    },
    async findById(id) {
        return await db.MedicalConditions.findByPk(id);
    },
    async findByCreatorId(creatorId) {
        return await db.MedicalConditions.findAll({ where: { creatorId } });
    },
    async create(creatorId, name, description) {
        return await db.MedicalConditions.create({ creatorId, name, description });
    },
    async update(id, creatorId, name, description) {
        const condition = await db.MedicalConditions.findByPk(id);
        if (!condition) { throw new Error('Condition not found') }
        if (condition.creatorId !== creatorId) { throw new Error('Condition not yours') }
        condition.name = name;
        condition.description = description;
        return await condition.save();
    },
    async findByIdList(idList){
        return await db.MedicalConditions.findAll({ where: { id: idList } });
    }
};