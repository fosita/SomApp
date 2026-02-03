const db = require('../sequelize.cjs');


module.exports = {
    async findById(id) {
        return await db.SomaInstructions.findByPk(id);
    },
    async findAllByDoctorId(doctorId) {
        return await db.SomaInstructions.findAll({ where: { doctorId } });
    },
    async findActiveByDoctorId(doctorId) {
        return await db.SomaInstructions.findAll({ where: { doctorId, active: true } });
    },
    async createInstruction(doctorId, title, content) {
        return await db.SomaInstructions.create({ doctorId, title, content, active: true });
    },
    async updateInstruction(id, title, content, active) {
        const instruction = await db.SomaInstructions.findByPk(id);
        if (!instruction) { throw new Error('Instruction not found'); }
        if(title) instruction.title = title;
        if(content) instruction.content = content;
        instruction.active = active;
        return await instruction.save();
    },
    async deleteInstruction(id) {
        const instruction = await db.SomaInstructions.findByPk(id);
        if (!instruction) { throw new Error('Instruction not found'); }
        return await instruction.destroy();
    }
};