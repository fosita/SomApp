const db = require('../sequelize.cjs');


module.exports = {
    async findAllByDoctorId(doctorId) {
        return await db.Appointments.findAll({ where: { doctorId }, raw: true });
    },
    async findAllByPatientId(patientId) {
        return await db.Appointments.findAll({ where: { patientId }, raw: true });
    },
    async findAllByPatientIdAndDoctorId(patientId, doctorId) {
        return await db.Appointments.findAll({ where: { patientId, doctorId }, raw: true });
    },
    async findAllByRoomId(roomId) {
        return await db.Appointments.findAll({ where: { roomId }, raw: true });
    },
    async findById(id) {
        return await db.Appointments.findByPk(id);
    },
    async create(doctorId, patientId, roomId, proposedBy, start, end, topic,
                 reason, statusId, methodId) {
        return await db.Appointments.create({
            doctorId,
            patientId,
            roomId: roomId || null,
            proposedBy,
            start,
            end,
            topic,
            reason,
            statusId,
            methodId: methodId || null,
        });
    },
    async update(id, roomId, start, end, topic, reason, statusId, methodId, attend) {
        const appointment = await db.Appointments.findByPk(id);
        if (appointment) {
            appointment.roomId = roomId || appointment.roomId;
            appointment.start = start || appointment.start;
            appointment.end = end || appointment.end;
            appointment.topic = topic || appointment.topic;
            appointment.reason = reason || appointment.reason;
            appointment.methodId = methodId || appointment.methodId;
            appointment.statusId = statusId || appointment.statusId;
            if (attend !== undefined) appointment.attend = attend;
            await appointment.save();
            return appointment;
        }
        throw new Error('Cita no encontrada');
    },
    async delete(id) {
        const appointment = await db.Appointments.findByPk(id);
        if (appointment) { await appointment.destroy(); return true }
        throw new Error('Cita no encontrada');
    }
};