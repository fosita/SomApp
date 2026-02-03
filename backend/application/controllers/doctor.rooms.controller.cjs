const repository = require('../../infrastructure/repositories/doctor.rooms.repository.cjs');
module.exports = {
    async create(req, res) {
        try {
            const { doctorId, name, address } = req.body;
            const createdRoom = await repository.create(doctorId, name, address);
            res.status(201).json(createdRoom);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async update(req, res) {
        const {id, doctorId, name, address, photo} = req.body;
        try {
            const updatedCondition = await repository.update(id, doctorId, name, address, photo);
            res.status(200).json(updatedCondition);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async delete(req, res) {
        try {
            const { roomId } = req.params;
            await repository.delete(Number(roomId));
            res.status(200).json({ message: 'Habitación eliminada con éxito' });
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findByDoctorId(req, res) {
        try {
            const { doctorId } = req.params;
            const rooms = await repository.findAllByDoctorId(Number(doctorId));
            res.status(200).json(rooms);
        } catch (err) { res.status(500).json({ error: err.message }) }
    },

    async findById(req, res) {
        try {
            const { roomId } = req.params;
            const room = await repository.findById(Number(roomId));
            res.status(200).json(room);
        } catch (err) { res.status(500).json({ error: err.message }) }
    }
}
