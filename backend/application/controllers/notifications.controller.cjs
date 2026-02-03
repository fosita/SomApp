const repository = require('../../infrastructure/repositories/notifications.repository.cjs');
const {HttpStatusCode} = require("axios");

module.exports = {
    async getByPatientId(req, res) {
        try {
            const {patientId} = req.params;
            if (!patientId || isNaN(patientId))
                return res.status(HttpStatusCode.BadRequest).json({error: 'ID del paciente inválida'});

            const notifications = await repository.findByPatientId(patientId);
            const markedPromises = [];
            for(const notification of notifications)
                if(!notification.shown) markedPromises.push(repository.markAsShown(notification.id));
            await Promise.all(markedPromises);

            res.status(HttpStatusCode.Ok).json(notifications.filter(n => !n.deleted));
        } catch (err) { res.status(HttpStatusCode.InternalServerError).json({error: err.message}) }
    },

    async getByPatientIdAndDoctorId(req, res) {
        try {
            const {patientId, doctorId} = req.params;
            if (!patientId || isNaN(patientId))
                return res.status(HttpStatusCode.BadRequest).json({error: 'ID del paciente inválida'});
            if (!doctorId || isNaN(doctorId))
                return res.status(HttpStatusCode.BadRequest).json({error: 'ID del doctor inválida'});

            const notifications = await repository.findByPatientIdAndDoctorId(patientId, doctorId);
            res.status(HttpStatusCode.Ok).json(notifications);
        } catch (err) { res.status(HttpStatusCode.InternalServerError).json({error: err.message}) }
    },

    async markAsDelete(req, res) {
        try {
            const {notificationId} = req.params;
            if (!notificationId || isNaN(notificationId))
                return res.status(HttpStatusCode.BadRequest).json({error: 'ID de la notificación inválida'});

            const deleted = await repository.findById(notificationId);
            if (!deleted) return res.status(HttpStatusCode.NotFound)
                .json({error: 'Notificación no encontrada'});

            deleted.deleted = true;
            await deleted.save();

            res.status(HttpStatusCode.Ok).json({message: 'Notificación eliminada correctamente'});
        } catch (err) { res.status(HttpStatusCode.InternalServerError).json({error: err.message}) }
    },
    async delete(req, res) {
        try {
            const {notificationId} = req.params;
            if (!notificationId || isNaN(notificationId))
                return res.status(HttpStatusCode.BadRequest).json({error: 'ID de la notificación inválida'});

            const deleted = await repository.findById(notificationId);
            if (!deleted) return res.status(HttpStatusCode.NotFound)
                .json({error: 'Notificación no encontrada'});

            await deleted.destroy();

            res.status(HttpStatusCode.Ok).json({message: 'Notificación eliminada correctamente'});
        } catch (err) { res.status(HttpStatusCode.InternalServerError).json({error: err.message}) }
    },

    async create(req, res){
        try {
            let {doctorId, patientId} = req.params;
            const {summary, detail, severityId} = req.body;
            if (!doctorId || isNaN(doctorId))
                return res.status(HttpStatusCode.BadRequest).json({error: 'ID del doctor inválido'});
            if (!patientId || isNaN(patientId))
                return res.status(HttpStatusCode.BadRequest).json({error: 'ID del paciente inválido'});

            doctorId = Number(doctorId);
            patientId = Number(patientId);

            const notification = await repository
                .create(patientId, doctorId, summary, detail, severityId);
            if (notification) return res.status(HttpStatusCode.Ok).json(notification);
            res.status(HttpStatusCode.InternalServerError).json(notification);
        } catch (err) {
            res.status(500).json({error: err.message});
        }
    },
};