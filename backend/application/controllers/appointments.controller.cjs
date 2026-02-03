const repository = require('../../infrastructure/repositories/appointments.repository.cjs');
const {HttpStatusCode} = require("axios");

module.exports = {
    async getByDoctorId(req, res) {
        try {
            const { doctorId } = req.params;
            if(!doctorId || isNaN(doctorId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID del médico inválida' });

            const appointments = await repository.findAllByDoctorId(doctorId);
            res.status(HttpStatusCode.Ok).json(appointments);
        } catch (err) { res.status(HttpStatusCode.InternalServerError).json({ error: err.message });}
    },

    async getByPatientId(req, res) {
        try {
            const { patientId } = req.params;
            if(!patientId || isNaN(patientId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID del paciente inválida' });

            const appointments = await repository.findAllByPatientId(patientId);
            res.status(HttpStatusCode.Ok).json(appointments);
        } catch (err) { res.status(HttpStatusCode.InternalServerError).json({ error: err.message });}
    },

    async getByPatientIdAndDoctorId(req, res) {
        try {
            const { patientId, doctorId } = req.params;
            if(!patientId || isNaN(patientId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID del paciente inválida' });

            if(!doctorId || isNaN(doctorId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID del doctor inválida' });

            const appointments = await repository.findAllByPatientIdAndDoctorId(patientId, doctorId);
            res.status(HttpStatusCode.Ok).json(appointments);
        } catch (err) { res.status(HttpStatusCode.InternalServerError).json({ error: err.message });}
    },

    async getById(req, res) {
        try {
            const { appointmentId, doctorId, patientId } = req.params;
            if(doctorId && isNaN(doctorId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID del médico inválido' });

            if(patientId && isNaN(patientId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID del paciente inválido' });

            if(!appointmentId || isNaN(appointmentId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID de la cita inválido' });

            const appointment = await repository.findById(appointmentId);
            res.status(HttpStatusCode.Ok).json(appointment);
        } catch (err) { res.status(HttpStatusCode.InternalServerError).json({ error: err.message }); }
    },

    async create(req, res) {
        try {
            const { doctorId, patientId } = req.params;
            const { roomId, proposedBy, start, end, topic, reason, statusId, methodId } = req.body;
            if(!doctorId || isNaN(doctorId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID del médico inválido' });

            if(!patientId || isNaN(patientId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID del paciente inválido' });

            if (!statusId || isNaN(statusId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID de estado inválido' });

            if (!methodId || isNaN(methodId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID de método inválido' });

            if (proposedBy === undefined || isNaN(proposedBy))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'Creador inválido' });

            if(!start) return res.status(HttpStatusCode.BadRequest).json({ error: 'No hay hora de inicio' });
            if(!end) return res.status(HttpStatusCode.BadRequest).json({ error: 'No hay hora de finalización' });
            if(!topic) return res.status(HttpStatusCode.BadRequest).json({ error: 'No hay tema' });
            if(!reason) return res.status(HttpStatusCode.BadRequest).json({ error: 'No hay justificación' });

            const success = await repository
                .create(doctorId, patientId, roomId, proposedBy, start, end, topic, reason, statusId, methodId);
            if(success) return res.status(HttpStatusCode.Ok).json(success);
            res.status(HttpStatusCode.InternalServerError).json(success);
        } catch (err) { res.status(500).json({ error: err.message }); }
    },

    async update(req, res) {
        try {
            const { doctorId, patientId, appointmentId } = req.params;
            const { roomId, start, end, topic, reason, statusId, methodId, attend } = req.body;
            if(!appointmentId || isNaN(appointmentId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'Faltan parámetros' });
            if(doctorId && isNaN(doctorId) || patientId && isNaN(patientId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID del usuario inválido' });

            const success = await repository.update(appointmentId, roomId, start, end,
                topic, reason, statusId, methodId, attend);
            if(success) return res.status(HttpStatusCode.Ok).json(success);
            res.status(HttpStatusCode.InternalServerError).json(success);
        } catch (err) { res.status(500).json({ error: err.message }); }
    },


    async delete(req, res) {
        try {
            const { doctorId, patientId, appointmentId } = req.params;
            if(!appointmentId || isNaN(appointmentId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID de la cita inválido' });
            if(doctorId && isNaN(doctorId) || patientId && isNaN(patientId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID del usuario inválido' });

            const success = await repository.delete(appointmentId);
            if(success) return res.status(HttpStatusCode.Ok).json(success);
            res.status(HttpStatusCode.InternalServerError).json(success);
        } catch (e) {
            res.status(500).json({ error: e.message });
        }
    }
};