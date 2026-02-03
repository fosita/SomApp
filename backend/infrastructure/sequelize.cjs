require('dotenv').config({ path: './backend/.env' }); // Asegúrate de que esta línea esté al inicio
const data = require('../shared/initial.data.cjs');
const { Sequelize, DataTypes, Op } = require('sequelize');
const mysql = require('mysql2/promise');
const logger = require('../shared/utils/logger.util.cjs');
const {predictRecurrence} = require("../infrastructure/random.forest/random.forest.cjs");

// Leer variables de entorno
const DB_TYPE = process.env.DB_TYPE || 'mysql';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || 'root';
const DB_NAME = process.env.DB_NAME || 'somapp';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_UPDATE = JSON.parse(process.env.DB_UPDATE) || false;
const DB_DROP = JSON.parse(process.env.DB_DROP) || false;
const DB_MASTER = JSON.parse(process.env.DB_MASTER) || false;
const DB_DEMO = JSON.parse(process.env.DB_DEMO) || false;

// Paso 1: Crear la base de datos si no existe
async function ensureDatabase() {
    const connection = await mysql.createConnection({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASS,
        database: 'mysql', // nos conectamos a una DB por defecto
    });
    if(DB_DROP) connection.query('DROP DATABASE IF EXISTS `' + DB_NAME + '`;');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;`);
    logger.log(`✅ Base de datos '${DB_NAME}' verificada.`);
    await connection.end();
}

// Paso 2: Conectar Sequelize a la base real
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_TYPE,
    define: { underscored: true, paranoid: true, timestamps: true },
    logging: (sql) => logger.sql(sql),
});
/*
const toCamel = (s) => s.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
);
sequelize.addHook('afterFind', (result) => {
    const convert = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        for (const key of Object.keys(obj)) {
            const camel = toCamel(key);
            if (camel !== key) {
                obj[camel] = obj[key];
                delete obj[key];
            }
        }
        return obj;
    };

    if (Array.isArray(result)) result.forEach(convert)
    else convert(result);
});
*/

// Paso 3: Definir modelos
// =======================
// ALLERGIES
// =======================

/*
* @typedef {Object} Allergy
* @property {number} id - Identificador único de la alergia.
* @property {number} creatorId - ID del médico que creó la alergia.
* @property {string} name - Nombre de la alergia.
* @property {string} description - Descripción de la alergia.
 */
const Allergies = sequelize.define('Allergies', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    creatorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.STRING(2000), allowNull: false }
}, {
    indexes: [
        { name: 'unique_allergy', unique: true, fields: ['name'] },
        { name: 'allergies_per_doctor', fields: ['creator_id'] }
    ]
});
/*
* @typedef {Object} AllergiesPerPatient
* @property {number} id - Identificador único de la asociación.
* @property {number} patientId - ID del paciente.
* @property {number} allergyId - ID de la alergia asociada al paciente.
 */
const AllergiesPerPatient = sequelize.define('AllergiesPerPatient', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    patientId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    allergyId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false }
}, {
    indexes: [
        { name: 'unique_allergy_per_patient', unique: true, fields: ['allergy_id', 'patient_id'] },
        { name: 'allergies_per_patient_index', fields: ['patient_id', 'allergy_id'] }
    ]
});

// =======================
// APPOINTMENTS
// =======================

/*
* @typedef {Object} Appointment
* @property {number} id - Identificador único de la cita.
* @property {number} doctorId - ID del médico asociado a la cita.
* @property {number} patientId - ID del paciente asociado a la cita.
* @property {number} roomId - ID del consultorio del médico (si aplica).
* @property {number} proposedBy - Indica quién propuso la cita (1: médico, 2: paciente).
* @property {Date} start - Fecha y hora de inicio de la cita.
* @property {Date} end - Fecha y hora de finalización de la cita.
* @property {string} topic - Tema o motivo de la cita.
* @property {string} reason - Razón detallada de la cita.
* @property {boolean} attend - Indica si el paciente asistió a la cita.
* @property {number} statusId - ID del estado de la cita.
* @property {number} methodId - ID del tipo de cita.
 */
const Appointments = sequelize.define('Appointments', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    doctorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    patientId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    roomId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    proposedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    start: { type: DataTypes.DATE, allowNull: false },
    end: { type: DataTypes.DATE, allowNull: false },
    topic: { type: DataTypes.STRING(500), allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: false },
    attend: { type: DataTypes.BOOLEAN, allowNull: true },
    statusId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    methodId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }
}, {
    indexes: [
        { name: 'doctor_appointments', fields: ['doctor_id', 'start'] },
        { name: 'patient_appointments', fields: ['patient_id', 'start'] }
    ]
});
Appointments.addHook('beforeValidate', 'validateDoctorAvailability', async (appointment, options) => {
    if (!appointment.start || !appointment.end)
        throw new Error('La cita no tiene inicio o final');
    if (appointment.end <= appointment.start)
        throw new Error('El final de la cita debe ser posterior al inicio');
    const overlapping = await Appointments.findOne({
        where: {
            id: { [Op.ne]: appointment.id ?? 0 },
            statusId: 7,
            [Op.and]: [
                { start: { [Op.lt]: appointment.end } },
                { end: { [Op.gt]: appointment.start } },
                { [Op.or]: [
                    { doctorId: appointment.doctorId },
                    { patientId: appointment.patientId }
                ]}
            ]
        }
    });
    if (overlapping) throw new Error('El doctor, o paciente ya tienen una cita en este horario.');
});
/*
* @typedef {Object} AppointmentMethod
* @property {number} id - Identificador único del tipo de cita.
* @property {string} name - Nombre del tipo de cita.
* @property {string} color - Color asociado al tipo de cita.
* @property {boolean} requiresRoom - Indica si el tipo de cita requiere un consultorio.
*/
const AppointmentMethods = sequelize.define('AppointmentMethods', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    color: { type: DataTypes.STRING(20), allowNull: false },
    requiresRoom: { type: DataTypes.BOOLEAN, allowNull: false },
}, { indexes: [{ name: 'name', unique: true, fields: ['name'] }] });
/*
* @typedef {Object} AppointmentStatus
* @property {number} id - Identificador único del estado de la cita.
* @property {string} name - Nombre del estado de la cita.
* @property {string} color - Color asociado al estado de la cita.
* @property {number} doctor - Indica si el estado es aplicable para el médico (1) o no (0).
* @property {number} patient - Indica si el estado es aplicable para el paciente (1) o no (0).
 */
const AppointmentStatuses = sequelize.define('AppointmentStatuses', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    color: { type: DataTypes.STRING(20), allowNull: false },
    doctor: { type: DataTypes.SMALLINT, allowNull: false },
    patient: { type: DataTypes.SMALLINT, allowNull: false },
}, {
    tableName: 'appointment_statuses',
    indexes: [{ name: 'name', unique: true, fields: ['name'] }]
});

// =======================
// DOCTOR_ROOMS
// =======================

/*
* @typedef {Object} DoctorRoom
* @property {number} id - Identificador único del consultorio.
* @property {boolean} photo - Indica si el consultorio tiene foto asociada.
* @property {number} doctorId - ID del médico propietario del consultorio.
* @property {string} name - Nombre del consultorio.
* @property {string} address - Dirección del consultorio.
* @property {boolean} active - Indica si el consultorio está activo o no.
 */
const DoctorRooms = sequelize.define('DoctorRooms', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    photo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    doctorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    name: { type: DataTypes.STRING(100), allowNull: false },
    address: { type: DataTypes.STRING(255), allowNull: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, );


// =======================
// MEDICAL_CONDITIONS
// =======================

/*
* @typedef {Object} MedicalCondition
* @property {number} id - Identificador único de la condición médica.
* @property {number} creatorId - ID del médico que creó la condición médica.
* @property {string} name - Nombre de la condición médica.
* @property {string} description - Descripción de la condición médica.
*/
const MedicalConditions = sequelize.define('MedicalConditions', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    creatorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.STRING(2000), allowNull: false }
}, {
    indexes: [
        { name: 'uniqueMedicalCondition', unique: true, fields: ['name'] },
        { name: 'medicalConditions_per_doctor', fields: ['creator_id'] }
    ]
});
/*
* @typedef {Object} ConditionsPerPatient
* @property {number} id - Identificador único de la asociación.
* @property {number} patientId - ID del paciente.
* @property {number} conditionId - ID de la condición médica asociada al paciente.
 */
const ConditionsPerPatient = sequelize.define('ConditionsPerPatient', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    patientId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    conditionId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false }
}, {
    indexes: [
        { name: 'uniqueCondition_per_patient', unique: true, fields: ['patient_id', 'condition_id'] },
        { name: 'conditions_per_patient_index', fields: ['patient_id', 'condition_id'] }
    ]
});

// =======================
// MESSAGES
// =======================

/*
* @typedef {Object} Message
* @property {number} id - Identificador único del mensaje.
* @property {number} patientId - ID del paciente asociado al mensaje.
* @property {number} doctorId - ID del médico asociado al mensaje.
* @property {Date} date - Fecha y hora del mensaje.
* @property {boolean} fromPatient - Indica si el mensaje fue enviado por el paciente.
* @property {string} text - Contenido del mensaje.
* @property {string} doctor_note - Nota adicional del médico.
* @property {boolean} read - Indica si el mensaje ha sido leído.
*/
const Messages = sequelize.define('Messages', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    patientId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    doctorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    date: { type: DataTypes.DATE, allowNull: false },
    fromPatient: { type: DataTypes.BOOLEAN, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
    doctor_note: { type: DataTypes.TEXT, allowNull: false, defaultValue: "" },
    read: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, { indexes: [ { name: 'patient_index', fields: ['patient_id', 'date'] } ] });

// =======================
// NOTIFICATIONS
// =======================

/*
* @typedef {Object} Notification
* @property {number} id - Identificador único de la notificación.
* @property {number} doctorId - ID del médico asociado.
* @property {number} patientId - ID del paciente asociado.
* @property {string} summary - Resumen breve de la notificación.
* @property {string} detail - Detalle completo de la notificación.
* @property {number} severityId - ID de la severidad de la notificación.
* @property {boolean} shown - Indica si la notificación ha sido mostrada al usuario.
* @property {boolean} deleted - Indica si la notificación ha sido eliminada por el paciente.
*/
const Notifications = sequelize.define('Notifications', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    doctorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    patientId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    summary: { type: DataTypes.STRING(60), allowNull: false },
    detail: { type: DataTypes.STRING(400), allowNull: false },
    severityId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    shown: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    deleted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, {
    indexes: [
        { name: 'doctor_notifications', fields: ['patient_id', 'doctor_id'] },
        { name: 'unique_patient_notification_name', fields: ['patient_id', 'summary', 'detail'] }
    ]
});

/*
* @typedef {Object} NotificationSeverity
* @property {number} id - Identificador único de la severidad.
* @property {string} name - Nombre descriptivo de la severidad.
* @property {string} code - Código corto de la severidad.
* @property {string} color - Color asociado a la severidad.
*/
const NotificationSeverities= sequelize.define('NotificationSeverities', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(50), allowNull: false },
    code: { type: DataTypes.STRING(20), allowNull: false },
    color: { type: DataTypes.STRING(20), allowNull: false }
}, { indexes: [{ name: 'name', unique: true, fields: ['name'] }] })


// =======================
// PATIENTS_PER_DOCTOR
// =======================

/*
* @typedef {Object} PatientsPerDoctor
* @property {number} id - Identificador único de la asociación.
* @property {number} doctorId - ID del médico.
* @property {number} patientId - ID del paciente.
* @property {boolean} active - Indica si la asociación está activa o no.
*/
const PatientsPerDoctor = sequelize.define('PatientsPerDoctor', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    doctorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    patientId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, { indexes: [{ name: 'unique_patient_per_doctor', unique: true, fields: ['doctor_id', 'patient_id'] }] });

// =======================
// RISK FACTORS
// =======================

/*
* @typedef {Object} RiskFactor
* @property {number} id - Identificador único del factor de riesgo.
* @property {number} creatorId - ID del médico que creó el factor de riesgo.
* @property {string} name - Nombre del factor de riesgo.
* @property {string} description - Descripción del factor de riesgo.
* @property {number} risk - Nivel de riesgo asociado al factor (0-255).
*/
const RiskFactors = sequelize.define('RiskFactors', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    creatorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(2000), allowNull: false },
    risk: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false }
}, {  indexes: [{ name: 'risks_per_doctor', fields: ['creator_id'] }] });

/*
* @typedef {Object} RiskFactorPerPatient
* @property {number} id - Identificador único de la asociación.
* @property {number} patientId - ID del paciente.
* @property {number} riskFactorId - ID del factor de riesgo asociado al paciente.
*/
const RiskFactorsPerPatient = sequelize.define('RiskFactorsPerPatient', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    patientId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    riskFactorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false }
}, { indexes: [{ name: 'unique_fpp', unique: true, fields: ['patient_id', 'risk_factor_id'] }] });

// =======================
// SOMA_INSTRUCTIONS
// =======================

/*
* @typedef {Object} SomaInstruction
* @property {number} id - Identificador único de la instrucción.
* @property {number} doctorId - ID del médico que creó la instrucción.
* @property {string} title - Título de la instrucción.
* @property {string} content - Contenido detallado de la instrucción.
* @property {boolean} active - Indica si la instrucción está activa o no.
*/
const SomaInstructions = sequelize.define('SomaInstructions', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    doctorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    title: { type: DataTypes.STRING(60), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    active: { type: DataTypes.BOOLEAN, allowNull: false }
}, { indexes: [{ name: 'doctor_and_title', unique: true, fields: ['doctor_id', 'title'] }] });
/*
* @typedef {Object} InstructionsPerPatient
* @property {number} id - Identificador único de la asociación.
* @property {number} patientId - ID del paciente.
* @property {number} instructionId - ID de la instrucción asociada al paciente.
 */
const InstructionsPerPatient = sequelize.define('InstructionsPerPatient', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    patientId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    instructionId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false }
}, { indexes: [ { name: 'unique_ipp', unique: true, fields: ['patient_id', 'instruction_id'] } ] });

// =======================
// SPECIALTIES
// =======================

/*
* @typedef {Object} Specialty
* @property {number} id - Identificador único de la especialidad médica.
* @property {string} name - Nombre de la especialidad médica.
* @property {string} description - Descripción de la especialidad médica.
* @property {string} color - Color asociado a la especialidad médica.
 */
const Specialties = sequelize.define('Specialties', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.STRING(2000), allowNull: false },
    color: { type: DataTypes.STRING(20), allowNull: false }
}, { indexes: [{ name: 'name', unique: true, fields: ['name'] }] });

// =======================
// SYMPTOMS
// =======================

/*
* @typedef {Object} Symptom
* @property {number} id - Identificador único del síntoma.
* @property {number} creatorId - ID del médico que creó el síntoma.
* @property {string} name - Nombre del síntoma.
* @property {string} description - Descripción del síntoma.
* @property {number} severity - Nivel de severidad del síntoma (0-255).
*/
const Symptoms = sequelize.define('Symptoms', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    creatorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(2000), allowNull: false },
    severity: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false }
}, { indexes: [{ name: 'symptoms_per_doctor', fields: ['creator_id'] }] });
/*
* @typedef {Object} SymptomPerPatient
* @property {number} id - Identificador único de la asociación.
* @property {number} patientId - ID del paciente.
* @property {number} symptomId - ID del síntoma asociado al paciente.
*/
const SymptomsPerPatient = sequelize.define('SymptomsPerPatient', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    patientId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    symptomId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false }
}, {
    tableName: 'symptom_per_patient',
    indexes: [{ name: 'unique_symptoms_per_patient', unique: true, fields: ['patient_id', 'symptom_id'] }]
});

// =======================
// UNIVERSITIES
// =======================

/*
* @typedef {Object} University
* @property {number} id - Identificador único de la universidad.
* @property {string} acronym - Acrónimo de la universidad.
* @property {string} name - Nombre completo de la universidad.
* @property {string} icon - URL o ruta del ícono de la universidad.
*/
const Universities = sequelize.define('Universities', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    acronym: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    icon: { type: DataTypes.STRING(255), allowNull: true }
}, {
    tableName: 'universities',
    timestamps: true,
    paranoid: true
});

// =======================
// Predictions
// =======================

/*
* @typedef {Object} Prediction
* @property {number} id - Identificador único de la predicción.
* @property {number} patientId - ID del paciente asociado a la predicción.
* @property {Object} input_data - Datos de entrada utilizados para generar la predicción.
* @property {number} risk_score - Puntuación de riesgo predicha.
*/
const Predictions = sequelize.define('Predictions', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    patientId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    inputData: { type: DataTypes.JSON, allowNull: false },
    riskScore: { type: DataTypes.FLOAT.UNSIGNED, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
}, {
    tableName: 'predictions',
    indexes: [ { name: 'patient_predictions', fields: ['patient_id', 'date'], unique: true } ]
});
/*
* @typedef {Object} PredictionParams
* @property {number} id - Identificador único del rol.
* @property {number} tumorSize - Tamaño del tumor en mm.
* @property {number} lymphNodeCount - Número de ganglios linfáticos afectados.
* @property {boolean} metastasis - Indica si hay metástasis (true/false).
* @property {number} ca153Marker - Nivel del marcador tumoral CA 15-3.
* @property {boolean} chemotherapy - Indica si el paciente recibió quimioterapia (true/false).
* @property {number} chemoCycles - Número de ciclos de quimioterapia recibidos.
* @property {boolean} radiotherapy - Indica si el paciente recibió radioterapia (true/false).
* @property {number} surgery - Tipo de cirugía realizada (0: ninguna, 1: lumpectomía, 2: mastectomía).
* @property {number} patientId - ID del paciente asociado a los parámetros.
* @property {number} doctorId - ID del médico que ingresó los parámetros.
*/
const PredictionParams = sequelize.define('prediction_params', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    tumorSize: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    lymphNodeCount: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    metastasis: { type: DataTypes.BOOLEAN, allowNull: false },
    ca153Marker: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },

    chemotherapy: { type: DataTypes.BOOLEAN, allowNull: false },
    chemoCycles: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    radiotherapy: { type: DataTypes.BOOLEAN, allowNull: false },
    surgery: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },

    patientId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    doctorId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
})

// =======================
// USERS
// =======================

/*
* @typedef {Object} User
* @property {number} id - Identificador único del usuario.
* @property {number} roleId - ID del rol del usuario.
* @property {boolean} photo - Indica si el usuario tiene foto de perfil.
* @property {string} dniCe - Documento de identidad o carnet de extranjería.
* @property {string} name - Nombre del usuario.
* @property {string} lastname - Apellido del usuario.
* @property {Date} birthdate - Fecha de nacimiento del usuario.
* @property {number sex - Sexo del usuario (0: femenino, 1: masculino).
* @property {string} email - Correo electrónico del usuario.
* @property {string} phone - Número de teléfono del usuario.
* @property {string} username - Nombre de usuario para inicio de sesión.
* @property {string} hashPassword - Contraseña encriptada del usuario.
* @property {number} universityId - ID de la universidad del usuario (si aplica).
* @property {Date} egresateDate - Fecha de egreso de la universidad (si aplica).
* @property {number} specialtyId - ID de la especialidad médica del usuario (si aplica).
* @property {string} cpm - Código de colegiatura profesional médica (si aplica).
* @property {string} rne - Registro nacional de especialidades (si aplica).
* @property {boolean} active - Indica si el usuario está activo.
* @property {string} token - Token para recuperación de contraseña o verificación.
* @property {number} failed_attempts - Número de intentos fallidos de inicio de sesión.
* @property {Date} bannedUntil - Fecha hasta la cual el usuario está bloqueado (si aplica).
* @property {Date} lastLoginAt - Fecha y hora del último inicio de sesión.
* @property {boolean} linkable - Indica si el usuario puede ser vinculado a pacientes.
* @property {number} weight - Peso del usuario en kg (si aplica).
* @property {number} height - Altura del usuario en m (si aplica).
* @property {number} bmi - Índice de masa corporal (Calculado en get).
*/
const Users = sequelize.define('Users', {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    roleId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    photo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    dniCe: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    lastname: { type: DataTypes.STRING(100), allowNull: false },
    birthdate: { type: DataTypes.DATEONLY, allowNull: false },
    sex: { type: DataTypes.BOOLEAN, allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(30), allowNull: false, unique: true },
    username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    hashPassword: { type: DataTypes.STRING(100), allowNull: false },
    universityId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    egresateDate: { type: DataTypes.DATE, allowNull: true },
    specialtyId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    cpm: { type: DataTypes.STRING(20), allowNull: true },
    rne: { type: DataTypes.STRING(20), allowNull: true },
    active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    token: { type: DataTypes.STRING(255), allowNull: true },
    otp: { type: DataTypes.STRING(6), allowNull: true, defaultValue: null },
    otpExpiry: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    failedAttempts: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    bannedUntil: { type: DataTypes.DATE, allowNull: true },
    lastLoginAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    linkable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    termsAccepted: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    weight: { type: DataTypes.FLOAT.UNSIGNED, allowNull: true },
    height: { type: DataTypes.FLOAT.UNSIGNED, allowNull: true },
    bmi: {
        type: DataTypes.VIRTUAL,
        get() {
            const weight = this.getDataValue('weight');
            const height = this.getDataValue('height');
            if (!weight || !height || height === 0) return null;
            return +(weight / (height * height)).toFixed(2); // resultado redondeado
        }
    },
}, {
    tableName: 'users',
    indexes: [
        { name: 'index_login', fields: ['username', 'hash_password'] },
        { name: 'index_email', fields: ['email'] },
        { name: 'index_dni', fields: ['dni_ce'] },
    ]
});
/*
* @typedef {Object} Role
* @property {number} id - Identificador único del rol.
* @property {string} name - Nombre descriptivo del rol.
*/
const Roles = sequelize.define('roles', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true }
});

// Relaciones: Foreign Keys
// User ↔ Types

// ===================
// USERS
// ===================
Users.belongsTo(Roles, { foreignKey: 'roleId', as: 'role' });
Users.belongsTo(Specialties, { foreignKey: 'specialty_id', as: 'specialty' });
Users.belongsTo(Universities, { foreignKey: 'university_id', as: 'university' });

// ===================
// PATIENTS_PER_DOCTOR
// ===================
PatientsPerDoctor.belongsTo(Users, { foreignKey: 'doctor_id', as: 'doctor' });
PatientsPerDoctor.belongsTo(Users, { foreignKey: 'patient_id', as: 'patient' });


// ===================
// APPOINTMENTS
// ===================
Appointments.belongsTo(DoctorRooms, { foreignKey: 'doctor_room', as: 'room' });
Appointments.belongsTo(AppointmentStatuses, { foreignKey: 'status_id', as: 'status' });
Appointments.belongsTo(AppointmentMethods, { foreignKey: 'method_id', as: 'method' });
Appointments.belongsTo(Roles, { foreignKey: 'proposed_by', as: 'proposer' });
Appointments.belongsTo(PatientsPerDoctor,{ foreignKey: 'doctor_id', targetKey: 'doctor_id', as: 'doctor'});
Appointments.belongsTo(PatientsPerDoctor,{ foreignKey: 'patient_id', targetKey: 'patient_id', as: 'patient'});

//

// ===================
// ALLERGIES
// ===================
Allergies.belongsTo(Users, { foreignKey: 'creator_id', as: 'doctor' });
AllergiesPerPatient.belongsTo(Users, { foreignKey: 'patient_id', as: 'patient' });
AllergiesPerPatient.belongsTo(Allergies, { foreignKey: 'allergy_id', as: 'allergy' });

// ===================
// MEDICAL_CONDITIONS
// ===================
MedicalConditions.belongsTo(Users, { foreignKey: 'creator_id', as: 'doctor' });
ConditionsPerPatient.belongsTo(Users, { foreignKey: 'patient_id', as: 'patient' });
ConditionsPerPatient.belongsTo(MedicalConditions, { foreignKey: 'condition_id', as: 'condition' });

// ===================
// INSTRUCTIONS_PER_PATIENT
// ===================
SomaInstructions.belongsTo(Users, { foreignKey: 'doctor_id', as: 'doctor' });
InstructionsPerPatient.belongsTo(Users,{ foreignKey: 'patient_id', as: 'patient' });
InstructionsPerPatient.belongsTo(SomaInstructions,{ foreignKey: 'instruction_id', as: 'instruction' });

// ===================
// DOCTOR_ROOMS
// ===================
DoctorRooms.belongsTo(Users, { foreignKey: 'doctor_id', as: 'doctor' });

// ===================
// MESSAGES
// ===================
Messages.belongsTo(Users, { foreignKey: 'patient_id', as: 'patient' });
Messages.belongsTo(Users, { foreignKey: 'doctor_id', as: 'doctor' });

// ===================
// NOTIFICATIONS
// ===================
Notifications.belongsTo(PatientsPerDoctor,{foreignKey: 'patient_id', targetKey: 'patient_id', as: 'patient'});
Notifications.belongsTo(PatientsPerDoctor,{foreignKey: 'doctor_id', targetKey: 'doctor_id', as: 'doctor'});
Notifications.belongsTo(NotificationSeverities,{ foreignKey: 'severity_id', as: 'severity'});

// ===================
// RISKS
// ===================
RiskFactors.belongsTo(Users, { foreignKey: 'creator_id', as: 'doctor' });
RiskFactorsPerPatient.belongsTo(Users, { foreignKey: 'patient_id', as: 'patient' });
RiskFactorsPerPatient.belongsTo(RiskFactors, { foreignKey: 'risk_factor_id', as: 'risk' });

// ===================
// SYMPTOMS
// ===================
Symptoms.belongsTo(Users, { foreignKey: 'creator_id', as: 'doctor' });
SymptomsPerPatient.belongsTo(Users, { foreignKey: 'patient_id', as: 'patient' });
SymptomsPerPatient.belongsTo(Symptoms, { foreignKey: 'symptom_id', as: 'symptom' });

// ===================
// PREDICTIONS
// ===================
Predictions.belongsTo(Users, { foreignKey: 'patient_id', as: 'patient' });

// Paso 4: Ejecutar creación de BD + sincronización
(async () => {
    try {
        await ensureDatabase();
        await sequelize.authenticate();
        logger.log('✅ Conexión establecida correctamente.');

        if(DB_DROP) {
            await sequelize.sync({ force: true }); // elimina y crea tablas
            logger.log('✅ Tablas eliminadas y recreadas.');
        }
        else if(DB_UPDATE) {
            await sequelize.sync({ alter: true }); // crea tablas si no existen, actualiza si cambian
            logger.log('✅ Tablas sincronizadas.');
        }
        if(DB_MASTER){
            logger.log("⌛ Insertando datos maestros...");
            await Promise.all([
                Universities.bulkCreate(data.Universities, { ignoreDuplicates: true }),
                Specialties.bulkCreate(data.Specialties, { ignoreDuplicates: true }),
                Allergies.bulkCreate(data.Allergies, { ignoreDuplicates: true }),
                MedicalConditions.bulkCreate(data.MedicalConditions, { ignoreDuplicates: true }),
                RiskFactors.bulkCreate(data.RiskFactors, { ignoreDuplicates: true }),
                AppointmentStatuses.bulkCreate(data.AppointmentStatuses, { ignoreDuplicates: true }),
                AppointmentMethods.bulkCreate(data.AppointmentMethods, { ignoreDuplicates: true }),
                NotificationSeverities.bulkCreate(data.NotificationSeverities, { ignoreDuplicates: true }),
                Roles.bulkCreate(data.Roles, { ignoreDuplicates: true }),
                Symptoms.bulkCreate(data.Symptoms, { ignoreDuplicates: true })
            ]);
            logger.log("✅ Datos maestros insertados correctamente.");
        }
        if(DB_DEMO){
            logger.log("⌛ Aplicando salt hash a las contraseñas de demostración...");
            for (const user of data.Users) {user.hashPassword = await user.hashPassword}
            logger.log("✅ Salt hash aplicado correctamente.");

            logger.log("⌛ Insertando datos de demostración...");
            await Promise.all([
                Users.bulkCreate(data.Users, { ignoreDuplicates: true }),
                PatientsPerDoctor.bulkCreate(data.PatientsPerDoctor, { ignoreDuplicates: true }),
                AllergiesPerPatient.bulkCreate(data.AllergiesPerPatient, { ignoreDuplicates: true }),
                ConditionsPerPatient.bulkCreate(data.ConditionsPerPatient, { ignoreDuplicates: true }),
                SymptomsPerPatient.bulkCreate(data.SymptomsPerPatient, { ignoreDuplicates: true }),
                RiskFactorsPerPatient.bulkCreate(data.RiskFactorsPerPatient, { ignoreDuplicates: true }),
                Notifications.bulkCreate(data.Notifications, { ignoreDuplicates: true }),
                DoctorRooms.bulkCreate(data.DrRooms, {ignoreDuplicates: true}),
            ]);
            logger.log('✅ Datos de demostración insertados correctamente.');
        }
        if(DB_MASTER || DB_DEMO || DB_UPDATE || DB_DROP)
            logger.log('✅ Configuración de la base de datos completada.');

        // Create a task that calls prediction every day at midnight
        const predCtrl = require('../application/controllers/predictions.controller.cjs');

        //ejecutar una vez al iniciar el servidor
        async function runPredictionJob() {
            logger.log('⏰ Ejecutando generación de predicciones para todos los pacientes.');
            try {
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date();
                endOfDay.setHours(23, 59, 59, 999);

                const lastReg = await Predictions.findAll({ where: {
                    createdAt: { [Op.between]: [startOfDay, endOfDay] } }, raw: true })
                if(lastReg.length) return logger.log('⏳ Las predicciones ya se generaron.');

                const patients = await Users.findAll({where: {roleId: 1}, raw: true});
                for(const patient of patients){
                    const rows = await RiskFactorsPerPatient.findAll({
                        where: { patientId: patient.id },
                        include: [{ model: RiskFactors, as: 'risk' }]
                    });

                    // Sumatoria de riesgos
                    const risk = rows.reduce((t, r) => t + r.risk.risk, 0);
                    const prediction = await predictRecurrence({
                        patientId: patient.id,
                        age: patient.birthdate ? Math.floor((new Date() - new Date(patient.birthdate).getTime()) /
                            (365.25 * 24 * 60 * 60 * 1000) ) : 50,
                        weight: patient.weight || 70,
                        height: patient.height || 1.7,
                        risk: risk || 0,

                        tumor_size: 20,
                        lymph_node_count: 2,
                        metastasis: 0,
                        ca15_3_marker: 30,
                        chemotherapy: 1,
                        chemo_cycles: 6,
                        radiotherapy: 1,
                        surgery: 1,
                        margin: 1,
                        last_appointment_date: new Date(),
                        dates_count: 5,
                        symptoms: 2
                    }); await Predictions.create(prediction);
                } console.log("Predicciones generadas para todos los pacientes");
                logger.log('✅ Predicciones generadas correctamente para todos los pacientes.');
            } catch (error) {logger.error('❌ Error al generar predicciones diarias:', error)}
        }

        await runPredictionJob();
        const ticker = setInterval(runPredictionJob, 5 * 60 * 1000);
    } catch (error) { logger.error('❌ Error al conectar o sincronizar:', error); }
})();


module.exports = {
    sequelize,
    DataTypes,
    Allergies,
    AllergiesPerPatient,
    AppointmentStatuses,
    AppointmentMethods,
    Appointments,
    ConditionsPerPatient,
    DoctorRooms,
    InstructionsPerPatient,
    MedicalConditions,
    Messages,
    Notifications,
    NotificationSeverities,
    PatientsPerDoctor,
    Predictions,
    PredictionParams,
    RiskFactors,
    RiskFactorsPerPatient,
    Roles,
    SomaInstructions,
    Specialties,
    Symptoms,
    SymptomsPerPatient,
    Universities,
    Users
};