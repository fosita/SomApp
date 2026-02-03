const repository = require('../../infrastructure/repositories/soma.instructions.repository.cjs');
const {HttpStatusCode} = require("axios");


module.exports = {
    async getByDoctorId(req, res) {
        try {
            const { doctorId } = req.params;
            if(!doctorId || isNaN(doctorId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID del médico inválida' });

            const instructions = await repository.findAllByDoctorId(doctorId);
            res.status(HttpStatusCode.Ok).json(instructions);
        } catch (err) { res.status(HttpStatusCode.InternalServerError).json({ error: err.message });}
    },

    async getById(req, res) {
        try {
            const { doctorId, instructionId } = req.params;
            if(!doctorId || isNaN(doctorId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID del médico inválida' });

            if(!instructionId || isNaN(instructionId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID de la instrucción inválida' });

            const instruction = await repository.findById(instructionId);
            res.status(HttpStatusCode.Ok).json(instruction);
        } catch (err) { res.status(HttpStatusCode.InternalServerError).json({ error: err.message }); }
    },

    async create(req, res) {
        try {
            const { doctorId } = req.params;
            const { title, content } = req.body;
            if(!doctorId)
                return res.status(HttpStatusCode.BadRequest).json({ error: 'Faltan parámetros' });

            if(isNaN(doctorId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'Parámetros inválidos' });

            const success = await repository.createInstruction(doctorId, title, content);
            if(success) return res.status(HttpStatusCode.Ok).json(success);
            res.status(HttpStatusCode.InternalServerError).json(success);
        } catch (err) { res.status(500).json({ error: err.message }); }
    },

    async update(req, res) {
        try {
            const { doctorId, instructionId } = req.params;
            const {title, content, active} = req.body;
            if(!doctorId || !instructionId)
                return res.status(HttpStatusCode.BadRequest).json({ error: 'Faltan parámetros' });

            if(isNaN(doctorId) || isNaN(instructionId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'Parámetros inválidos' });

            const success = await repository.updateInstruction(instructionId, title, content, active);
            if(success) return res.status(HttpStatusCode.Ok).json(success);
            res.status(HttpStatusCode.InternalServerError).json(success);
        } catch (err) { res.status(500).json({ error: err.message }); }
    },

    async delete(req, res) {
        try {
            const { doctorId, instructionId } = req.params;
            if(!doctorId || !instructionId)
                return res.status(HttpStatusCode.BadRequest).json({ error: 'Faltan parámetros' });

            if(isNaN(doctorId) || isNaN(instructionId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'Parámetros inválidos' });

            await repository.deleteInstruction(instructionId);
            return res.status(HttpStatusCode.Ok).json({success: true});
        } catch (err) { res.status(500).json({ error: err.message }); }
    }

};