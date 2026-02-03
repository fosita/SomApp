const db = require('../sequelize.cjs');
module.exports = {
    async findAll() { return await db.RiskFactors.findAll() },
    async findById(id) { return await db.RiskFactors.findByPk(id) },
    async findByCreatorId(creatorId) {
        return await db.RiskFactors.findAll({ where: { creatorId }, raw: true });
    },
    async create(creatorId, name, description, risk) {
        return await db.RiskFactors.create({ creatorId, name, description, risk });
    },
    async update(id, creatorId, name, description, risk) {
        const rf = await db.RiskFactors.findByPk(id);
        if (!rf) { throw new Error(`No existe un riesgo con el id ${id}`) }
        if (rf.creatorId !== creatorId)
            throw new Error('No puedes editar un factor de riesgo que no ha sido creado por tí')
        rf.name = name;
        rf.description = description;
        rf.risk = risk;
        return await rf.save();
    },
    async findByIdList(idList){
        return await db.RiskFactors.findAll({ where: { id: idList }, raw: true })
    }
};