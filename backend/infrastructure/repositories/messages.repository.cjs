const db = require('../sequelize.cjs');
module.exports = {
    async findByPatientId(patientId) {
        return (await db.Messages.findAll({ where: { patientId } }))
            .sort((a, b) => a.date - b.date);

    },
    async create(patientId, doctorId, fromPatient, text) {
        if(!doctorId) doctorId = null;
        const date = new Date();
        return db.Messages.create({ patientId, doctorId, fromPatient, text, date});
    },
    async setTextMessage(id, text) {
        const date = new Date();
        const message = await db.Messages.findByPk(id);
        if (!message) { throw new Error('Message not found') }
        message.text = text;
        message.date = date;
        return await message.save();
    },
    async setDoctorNote(id, doctor_note) {
        const message = await db.Messages.findByPk(id);
        if (!message) { throw new Error('Message not found') }
        message.doctor_note = doctor_note;
        return await message.save();
    },
    async setReadStatus(id, read) {
        const message = await db.Messages.findByPk(id);
        if (!message) { throw new Error('Message not found') }
        message.read = read;
        return await message.save();
    },
};