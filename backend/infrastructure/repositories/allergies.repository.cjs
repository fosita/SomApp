const db = require('../sequelize.cjs');


module.exports = {
    async findAll() { return await db.Allergies.findAll() },
    async findById(id) { return await db.Allergies.findByPk(id) },
    async findByCreatorId(creatorId) {
        return await db.Allergies.findAll({ where: { creatorId }, raw: true });
    },
    async create(creatorId, name, description) {
        return await db.Allergies.create({ creatorId, name, description });
    },
    async update(id, creatorId, name, description) {
        const allergy = await db.Allergies.findByPk(id);
        if (!allergy) { throw new Error('Allergy not found') }
        if (allergy.creatorId !== creatorId) { throw new Error('Allergy not yours') }
        allergy.name = name;
        allergy.description = description;
        return await allergy.save();
    },
    async findByIdList(idList){
        return await db.Allergies.findAll({ where: { id: idList }, raw: true })
    }
};