const express = require('express');
const router = express.Router();
const userCtrl = require('../../application/controllers/user.controller.cjs');
const alleCtrl = require('../../application/controllers/allergies.controller.cjs');
const condCtrl = require('../../application/controllers/medical.conditions.controller.cjs');
const specCtrl = require('../../application/controllers/specialities.controller.cjs');
const unisCtrl = require('../../application/controllers/universities.controller.cjs');
const appointCtrl = require('../../application/controllers/appointments.controller.cjs');
const appStCtrl = require('../../application/controllers/appointment.status.controller.cjs');
const appMtCtrl = require('../../application/controllers/appointment.methods.controller.cjs');
const drRoomCtrl = require('../../application/controllers/doctor.rooms.controller.cjs');
const msgCtrl = require('../../application/controllers/messages.controller.cjs');
const notCtrl = require('../../application/controllers/notifications.controller.cjs');
const notSvCtrl = require('../../application/controllers/notification.severities.controller.cjs');
const predCtrl = require('../../application/controllers/predictions.controller.cjs');
const riskCtrl = require('../../application/controllers/risk.factors.controller.cjs');
const rolesCtrl = require('../../application/controllers/roles.controller.cjs');
const symtCtrl = require('../../application/controllers/symptoms.controller.cjs');

const aPPCtrl = require('../../application/controllers/allergies.per.patient.controller.cjs');
const cPPCtrl = require('../../application/controllers/conditions.per.patient.controller.cjs');
const pPDCtrl = require('../../application/controllers/patients.per.doctor.controller.cjs');
const rPPCtrl = require('../../application/controllers/risks.per.patient.controller.cjs');
const sPPCtrl = require('../../application/controllers/symptoms.per.patient.controller.cjs');

// Auth Methods
router.post('/register', userCtrl.registerUser);
router.post('/login', userCtrl.loginUser);
router.post('/login/otp', userCtrl.validateOTP);
router.post('/validate/token', userCtrl.validateToken);
router.post('/user/:userId/update', userCtrl.updateUser);


//add delay to all routes to simulate real world latency
router.get('/roles', rolesCtrl.findAll);
router.get('/roles/:roleId', rolesCtrl.findById);

//Universities
router.get('/universities', unisCtrl.findAll);
router.get('/universities/:universityId', unisCtrl.findById);

//Specialities
router.get('/specialities', specCtrl.findAll);
router.get('/specialities/:specialityId', specCtrl.findById);

//Appointment statuses
router.get('/appointments/statuses', appStCtrl.findAll)
router.get('/appointments/statuses/:statusId', appStCtrl.findById)

//Appointment Methods
router.get('/appointments/methods', appMtCtrl.findAll)
router.get('/appointments/methods/:methodId', appMtCtrl.findById)

//Notification Severities
router.get('/notifications/severities', notSvCtrl.findAll);
router.get('/notifications/severities/:severityId', notSvCtrl.findById);

// Allergy Methods
router.get('/allergies', alleCtrl.findAll);
router.get('/allergies/:allergiesId', alleCtrl.findById);
router.post('/allergies', alleCtrl.create);
router.put('/allergies/:allergiesId', alleCtrl.update);
router.get('/allergies/:allergiesId/patients', aPPCtrl.findByAllergyId);

// Condition Methods
router.get('/conditions', condCtrl.findAll);
router.get('/conditions/:conditionId', condCtrl.findById);
router.post('/conditions', condCtrl.create);
router.put('/conditions/:conditionId', condCtrl.update);
router.get('/conditions/:conditionId/patients', cPPCtrl.findByConditionId);

// Risk Factors Methods
router.get('/risks', riskCtrl.findAll);
router.get('/risks/:riskId', riskCtrl.findById);
router.post('/risks', riskCtrl.create);
router.put('/risks/:riskId', riskCtrl.update);

// Symptom Methods
router.get('/symptoms', symtCtrl.findAll);
router.get('/symptoms/:symptomId', symtCtrl.findById);
router.post('/symptoms', symtCtrl.create);
router.put('/symptoms/:symptomId', symtCtrl.update);



router.use(userCtrl.validateToken);

//Patient Mark terms as read
router.post('/patients/:patientId/terms/ok', userCtrl.markTermsAsRead);
// Patient Allergies
router.get('/patients/:patientId/allergies', aPPCtrl.findByPatientId);
router.post('/patients/:patientId/allergies/:allergyId', aPPCtrl.create);
router.delete('/patients/:patientId/allergies/:allergyId', aPPCtrl.delete);
// Patient Conditions
router.get('/patients/:patientId/conditions', cPPCtrl.findByPatientId);
router.post('/patients/:patientId/conditions/:conditionId', cPPCtrl.create);
router.delete('/patients/:patientId/conditions/:conditionId', cPPCtrl.delete);
// Patient Symptoms
router.get('/patients/:patientId/symptoms', sPPCtrl.findByPatientId);
router.post('/patients/:patientId/symptoms/:symptomId', sPPCtrl.create);
router.delete('/patients/:patientId/symptoms/:symptomId', sPPCtrl.delete);

// Patient Risk Factors
router.get('/patients/:patientId/risks', rPPCtrl.findByPatientId);
router.post('/patients/:patientId/risks/:riskId', rPPCtrl.create);
router.delete('/patients/:patientId/risks/:riskId', rPPCtrl.delete);
//Patient doctors
router.get('/patients/:patientId/doctors', pPDCtrl.getDoctorsPerPatient);
//Patient Appointments
router.get('/patients/:patientId/appointments', appointCtrl.getByPatientId);
router.put('/patients/:patientId/appointments/:appointmentId', appointCtrl.update);
router.delete('/patients/:patientId/appointments/:appointmentId', appointCtrl.delete);
router.get('/patients/:patientId/appointments/:appointmentId', appointCtrl.getById);
router.get('/patients/:patientId/doctors/:doctorId/appointments', appointCtrl.getByPatientIdAndDoctorId);
router.delete('/patients/:patientId/doctors/:doctorId/appointments/:appointmentId', appointCtrl.delete);
//Patient Messages
router.get('/patients/:patientId/messages', msgCtrl.getByPatientId);
router.post('/patients/:patientId/messages', msgCtrl.create);
router.get('/patients/:patientId/messages/gpt-response', msgCtrl.createGPTResponse);
router.put('/patients/:patientId/messages/:messageId/read', msgCtrl.setRead);
router.put('/patients/:patientId/messages/:messageId/text', msgCtrl.setText);
// Patient Notifications
router.get('/patients/:patientId/notifications', notCtrl.getByPatientId);
router.delete('/patients/:patientId/notifications/:notificationId', notCtrl.markAsDelete);
// patient predictions
router.get('/patients/:patientId/predictions', predCtrl.findByPatientId);
router.put('/patients/:patientId/predictions', predCtrl.regenerate);



// Doctor Allergies and Conditions
router.get('/doctors/:doctorId/allergies', alleCtrl.findAllByCreatorId);
router.get('/doctors/:doctorId/conditions', condCtrl.findAllByCreatorId);
router.get('/doctors/:doctorId/risks', riskCtrl.findAllByCreatorId);
router.get('/doctors/:doctorId/symptoms', symtCtrl.findAllByCreatorId);
//Doctor Patients
router.post('/doctors/:doctorId/patients/:patientId', pPDCtrl.linkPatientToDoctor);
router.delete('/doctors/:doctorId/patients/:patientId', pPDCtrl.unlinkPatientFromDoctor);
router.get('/doctors/:doctorId/patients', pPDCtrl.getPatientsPerDoctor);
//Doctor Appointments
router.get('/doctors/:doctorId/appointments', appointCtrl.getByDoctorId);
router.get('/doctors/:doctorId/appointments/:appointmentId', appointCtrl.getById);


//Doctor patient appointments
router.get('/doctors/:doctorId/patients/:patientId/appointments', appointCtrl.getByPatientIdAndDoctorId);
router.post('/doctors/:doctorId/patients/:patientId/appointments', appointCtrl.create);
router.put('/doctors/:doctorId/patients/:patientId/appointments/:appointmentId', appointCtrl.update);
router.delete('/doctors/:doctorId/patients/:patientId/appointments/:appointmentId', appointCtrl.delete);
//Doctor Rooms
router.get('/doctors/:doctorId/rooms', drRoomCtrl.findByDoctorId);
router.get('/doctors/:doctorId/rooms/:roomId', drRoomCtrl.findById);
router.post('/doctors/:doctorId/rooms', drRoomCtrl.create);
router.put('/doctors/:doctorId/rooms/:roomId', drRoomCtrl.update);
router.delete('/doctors/:doctorId/rooms/:roomId', drRoomCtrl.delete);
//Doctor Patient Messages
router.get('/doctors/:doctorId/patients/:patientId/messages', msgCtrl.getByPatientId);
router.post('/doctors/:doctorId/patients/:patientId/messages', msgCtrl.create);
router.put('/doctors/:doctorId/patients/:patientId/messages/:messageId/text', msgCtrl.setText);
router.put('/doctors/:doctorId/patients/:patientId/messages/:messageId/doctorNote', msgCtrl.setDoctorNote);
// Doctor Notifications
router.get('/doctors/:doctorId/patients/:patientId/notifications', notCtrl.getByPatientIdAndDoctorId);
router.post('/doctors/:doctorId/patients/:patientId/notifications', notCtrl.create);
router.delete('/doctors/:doctorId/patients/:patientId/notifications/:notificationId', notCtrl.delete);
// Doctor patient predictions
router.get('/doctors/:doctorId/patients/:patientId/predictions', predCtrl.findByPatientId);


module.exports = router;