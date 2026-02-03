const repository = require('../../infrastructure/repositories/patients.per.doctor.repository.cjs');
const {HttpStatusCode} = require("axios");
const userUtils = require('../../shared/utils/user.utils.cjs');

module.exports = {
    async getPatientsPerDoctor(req, res) {
        try {
            const { doctorId } = req.params;
            if(!doctorId || isNaN(doctorId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID del médico inválida' });

            const pPD = await repository.findPatientsByDoctorId(doctorId);
            res.status(HttpStatusCode.Ok).json(pPD.map(userUtils.removeSensibleInfo));
        } catch (err) { res.status(HttpStatusCode.InternalServerError).json({ error: err.message });}
    },

    async getDoctorsPerPatient(req, res) {
        try {
            const { patientId } = req.params;
            if(!patientId || isNaN(patientId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'ID del paciente inválida' });

            const dPP = await repository.findDoctorsByPatientId(patientId);
            res.status(HttpStatusCode.Ok).json(dPP.map(userUtils.removeSensibleInfo));
        } catch (err) { res.status(HttpStatusCode.InternalServerError).json({ error: err.message }); }
    },

    async linkPatientToDoctor(req, res) {
        try {
            const { doctorId, patientId } = req.params;
            if(!doctorId || !patientId)
                return res.status(HttpStatusCode.BadRequest).json({ error: 'Faltan parámetros' });

            if(isNaN(patientId) || isNaN(doctorId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'Parámetros inválidos' });

            const success = await repository.linkPatientToDoctor(patientId, doctorId);
            if(success) return res.status(HttpStatusCode.Ok).json({ message: 'Paciente vinculado al médico' });
            res.status(HttpStatusCode.InternalServerError).json({ error: 'No se pudo vincular el paciente al médico' });
        } catch (err) { res.status(500).json({ error: err.message }); }
    },

    async unlinkPatientFromDoctor(req, res) {
        try {
            const { doctorId, patientId } = req.params;
            if(!doctorId || !patientId)
                return res.status(HttpStatusCode.BadRequest).json({ error: 'Faltan parámetros' });

            if(isNaN(patientId) || isNaN(doctorId))
                return res.status(HttpStatusCode.BadRequest).json({ error: 'Parámetros inválidos' });

            const success = await repository.unlinkPatientFromDoctor(patientId, doctorId);
            if(success) return res.status(HttpStatusCode.Ok).json({ message: 'Paciente desvinculado del médico' });
            res.status(HttpStatusCode.InternalServerError).json({ error: 'No se pudo desvincular el paciente del médico' });
        } catch (err) { res.status(500).json({ error: err.message }); }
    }
};