const db = require('../sequelize.cjs');
module.exports = {
    async findAll() { return await db.Symptoms.findAll() },
    async findById(id) { return await db.Symptoms.findByPk(id) },
    async findByCreatorId(creatorId) {
        return await db.Symptoms.findAll({ where: { creatorId }, raw: true });
    },
    async create(creatorId, name, description, severity) {
        return await db.Symptoms.create({ creatorId, name, description, severity });
    },
    async update(id, creatorId, name, description, severity) {
        const rf = await db.Symptoms.findByPk(id);
        if (!rf) { throw new Error(`No existe un síntoma con el id ${id}`) }
        if (rf.creatorId !== creatorId) throw new Error('No puedes editar un síntoma que no ha sido creado por tí')
        rf.name = name;
        rf.description = description;
        rf.severity = severity;
        return await rf.save();
    },
    async findByIdList(idList){
        return await db.Symptoms.findAll({ where: { id: idList }, raw: true })
    }
};