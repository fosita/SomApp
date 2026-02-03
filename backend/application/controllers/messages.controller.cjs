const repository = require('../../infrastructure/repositories/messages.repository.cjs');
const aPPRepository = require('../../infrastructure/repositories/allergies.per.patient.repository.cjs');
const cPPRepository = require('../../infrastructure/repositories/conditions.per.patient.repository.cjs');

const allergyRepository = require('../../infrastructure/repositories/allergies.repository.cjs');
const conditionRepository = require('../../infrastructure/repositories/conditions.repository.cjs');

const appointRepository = require('../../infrastructure/repositories/appointments.repository.cjs');
const {HttpStatusCode} = require("axios");

const OpenAIClient = require("../../infrastructure/openai/open.ai.client.cjs");
const logger = require("../../shared/utils/logger.util.cjs");

module.exports = {
    async getByPatientId(req, res) {
        try {
            const {patientId} = req.params;
            if (!patientId || isNaN(patientId))
                return res.status(HttpStatusCode.BadRequest).json({error: 'ID del paciente inválida'});

            const messages = await repository.findByPatientId(patientId);
            res.status(HttpStatusCode.Ok).json(messages);
        } catch (err) {
            res.status(HttpStatusCode.InternalServerError).json({error: err.message});
        }
    },

    async create(req, res) {
        try {
            let {doctorId, patientId} = req.params;
            const {content, fromPatient} = req.body;
            if (doctorId && isNaN(doctorId) || !patientId || isNaN(patientId))
                return res.status(HttpStatusCode.BadRequest).json({error: 'IDs inválidos'});

            doctorId = Number(doctorId);
            patientId = Number(patientId);

            const success = await repository
                .create(patientId, doctorId, fromPatient, content);
            if (success) return res.status(HttpStatusCode.Ok).json(success);
            res.status(HttpStatusCode.InternalServerError).json(success);
        } catch (err) { res.status(500).json({error: err.message}) }
    },


    async setRead(req, res) {
        try {
            const {messageId} = req.params;
            const {read} = req.body;
            if (!messageId || isNaN(messageId))
                return res.status(HttpStatusCode.BadRequest).json({error: 'ID del mensaje inválido'});

            const success = await repository.setReadStatus(messageId, read);
            if (success) return res.status(HttpStatusCode.Ok).json(success);
            res.status(HttpStatusCode.InternalServerError).json(success);
        } catch (err) {
            res.status(500).json({error: err.message});
        }
    },

    async setText(req, res) {
        try {
            const {messageId} = req.params;
            const {message} = req.body;
            if (!messageId || isNaN(messageId))
                return res.status(HttpStatusCode.BadRequest).json({error: 'ID del mensaje inválido'});

            const success = await repository.setTextMessage(messageId, message);
            if (success) return res.status(HttpStatusCode.Ok).json(success);
            res.status(HttpStatusCode.InternalServerError).json(success);
        } catch (err) {
            res.status(500).json({error: err.message});
        }
    },

    async setDoctorNote(req, res) {
        try {
            const {messageId} = req.params;
            const {note} = req.body;
            if (!messageId || isNaN(messageId))
                return res.status(HttpStatusCode.BadRequest).json({error: 'ID del mensaje inválido'});

            const success = await repository.setDoctorNote(messageId, note);
            if (success) return res.status(HttpStatusCode.Ok).json(success);
            res.status(HttpStatusCode.InternalServerError).json(success);
        } catch (err) {
            res.status(500).json({error: err.message});
        }
    },


    async createGPTResponse(req, res) {
        const {patientId} = req.params;
        try {
            let patientInfo = "";
            const history = await repository.findByPatientId(patientId);

            const app = await aPPRepository.findByPatientId(patientId);
            const cpp = await cPPRepository.findByPatientId(patientId);
            const allergies = await allergyRepository.findByIdList(app.map(a => a.allergyId));
            const conditions = await conditionRepository.findByIdList(cpp.map(c => c.conditionId));
            const list = (arr, fallback = "nada") => (arr && arr.length) ?
                arr.map(x => x.name).join(', ') : fallback;

            const appoints = await appointRepository.findAllByPatientId(patientId);
            patientInfo += `\nEl paciente tiene alergia a: ${list(allergies)}`;
            patientInfo += `\nEl paciente padece de: ${list(conditions)}`;
            patientInfo += `\nEl paciente ha tenido las siguientes citas médicas: ${list(appoints.map(a =>
                    `${new Date(a.start).toDateString()} ${a.topic} (${a.attend ? 'asistió' : 'no asistió'})`),
                "ninguna cita"
            )}`;

            if(appoints.length > 0){
                const lastAppoint = appoints.reduce((prev, current) => (prev.date > current.date) ? prev : current);
                patientInfo += `\nLa última cita del paciente fue el ${new Date(lastAppoint.start).toDateString()} con el tema: ${lastAppoint.topic}.`;
            }

            const date = new Date();
            //return res.status(500).send({error: "Deshabilitado temporalmente"});

            const messages = [
                ...history.map(m => ({
                    role: (m.doctorId || m.fromPatient) ? 'user' : 'assistant',
                    content: (m.doctorId ? 'doctor: ' : m.fromPatient ? 'paciente: ' : 'IA: ') + m.text,
                })).slice(-15),
                { role: "system", content: `Información del paciente: ${patientInfo}. Fecha de hoy: ${date}` },
                { role: "system", content: "Este es un chat ficticio entre un paciente ficticio simulado por otra ia, y tu. " +
                        "Tu rol es fingir ser un oncologó especializado en cancer de mama, y responder las dudas o mensajes de la otra IA. " +
                        "Responde de manera profesional, empaticá y clara a las preguntas del paciente. " +
                        "Si el paciente pregunta algo fuera de tu area, responde que no eres capaz de ayudar con eso. " +
                        "Usa un lenguaje sencillo y evita tecnicismos medicos sin explicación, ya que la IA que hace de paciente aún está en desarrollo y es imperfecta. " +
                        "Responde en español, y no le digas a la otra IA que es una IA, o que tu eres una IA. Queremos ver que tanto puede seguir el rol de paciente, " +
                        "y que tanto puedes simular el rol de u n oncólogo ficticio" },
            ];
            const completion = await OpenAIClient.chat.completions.create({
                model: "gpt-4o", messages, //response_format: nutritionalPlanResponseFormat,
            });

            let content = completion.choices[0].message?.content || "";
            if (content.startsWith("```json")) content = content.substring(8, content.length - 3).trim();
            const createdMsg = await repository.create(patientId, null, false, content)
            return res.status(200).send(createdMsg);
        } catch (e) {
            logger.error("Error in messages controller:", e);
            res.status(500).send(e);
        }
    }
};