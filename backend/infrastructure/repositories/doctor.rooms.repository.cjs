const db = require('../sequelize.cjs');


module.exports = {
    async findAllByDoctorId(doctorId) {
        return await db.DoctorRooms.findAll({ where: { doctorId } });
    },
    async findById(id) {
        return await db.DoctorRooms.findByPk(id);
    },
    async create(doctorId, name, address) {
        return await db.DoctorRooms.create({ doctorId, name, address });
    },
    async update(roomId, doctorId, name, address, photo) {
        const room = await db.DoctorRooms.findByPk(roomId);
        if (!room) throw new Error('Habitación no encontrada');
        if (room.doctorId !== doctorId) throw new Error('No autorizado para actualizar esta habitación');

        room.name = name || room.name;
        room.address = address || room.address;
        room.photo = photo || room.photo;

        await room.save();
        return room;
    },
    async delete(roomId) {
        const room = await db.DoctorRooms.findByPk(roomId);
        if (!room) throw new Error('Habitación no encontrada');

        await room.destroy();
        return true;
    }
};