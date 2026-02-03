const bcrypt = require('bcrypt');
const { faker } = require('@faker-js/faker');
const salt = Number(process.env.BCRYPT_SALT_ROUNDS);

//Universidades del Perú
const Universities = [
    { acronym: 'UPC', name: 'Universidad Peruana de Ciencias Aplicadas', icon: '/universities/upc.png' },
    { acronym: 'PUCP', name: 'Pontificia Universidad Católica del Perú', icon: '/universities/pucp.png' },
    { acronym: 'UNI',  name: 'Universidad Nacional de Ingeniería', icon: '/universities/uni.png' },
    { acronym: 'UNMSM', name: 'Universidad Nacional Mayor de San Marcos', icon: '/universities/unsm.png' },
    { acronym: 'UP', name: 'Universidad del Pacífico', icon: '/universities/up.png' },
    { acronym: 'USIL', name: 'Universidad San Ignacio de Loyola', icon: '/universities/usil.png' },
    { acronym: 'UL', name: 'Universidad de Lima', icon: '/universities/ul.png' },
    { acronym: 'UDEP', name: 'Universidad de Piura', icon: '/universities/udep.png' },
    { acronym: 'UCSUR', name: 'Universidad Científica del Sur', icon: '/universities/ucsur.png' },
    { acronym: 'UIGV', name: 'Universidad Inca Garcilaso de la Vega', icon: '/universities/uigv.png' }
];
const Specialties = [
    {
        name: 'Oncología médica',
        description: 'Diagnóstico y tratamiento farmacológico del cáncer, incluyendo quimioterapia, inmunoterapia y hormonoterapia.',
        color: '#D32F2F'
    },
    {
        name: 'Oncología quirúrgica',
        description: 'Resección quirúrgica del tumor mamario y posibles ganglios afectados.',
        color: '#C2185B'
    },
    {
        name: 'Oncología radioterápica',
        description: 'Aplicación de radioterapia como tratamiento complementario o curativo del cáncer de mama.',
        color: '#7B1FA2'
    },
    {
        name: 'Ginecología',
        description: 'Seguimiento de salud mamaria, tamizaje y coordinación del tratamiento en mujeres adultas.',
        color: '#512DA8'
    },
    {
        name: 'Ginecología oncológica',
        description: 'Especialista en tumores ginecológicos, participa en manejo avanzado de cáncer de mama.',
        color: '#303F9F'
    },
    {
        name: 'Mastología',
        description: 'Especialista en patología mamaria benigna y maligna, clave en diagnóstico y cirugía.',
        color: '#1976D2'
    },
    {
        name: 'Medicina interna',
        description: 'Manejo integral de comorbilidades asociadas en pacientes oncológicos.',
        color: '#0288D1'
    },
    {
        name: 'Genética médica',
        description: 'Evaluación de riesgo hereditario (BRCA1/2) y asesoría genética para paciente y familia.',
        color: '#0097A7'
    },
    {
        name: 'Psicología clínica',
        description: 'Apoyo emocional, manejo de ansiedad, depresión y adaptación al diagnóstico.',
        color: '#00796B'
    },
    {
        name: 'Psiquiatría',
        description: 'Intervención en trastornos mentales severos o efectos secundarios psiquiátricos del tratamiento.',
        color: '#388E3C'
    },
    {
        name: 'Nutrición clínica',
        description: 'Soporte nutricional individualizado durante y después del tratamiento oncológico.',
        color: '#689F38'
    },
    {
        name: 'Rehabilitación y fisioterapia',
        description: 'Recuperación funcional post-cirugía, prevención de linfedema y movilidad del hombro.',
        color: '#AFB42B'
    },
    {
        name: 'Cirugía plástica y reconstructiva',
        description: 'Reconstrucción mamaria tras mastectomía o tumorectomía.',
        color: '#FBC02D'
    },
    {
        name: 'Medicina paliativa',
        description: 'Control de síntomas, dolor y cuidados en etapas avanzadas.',
        color: '#FFA000'
    },
    {
        name: 'Radiología',
        description: 'Imagenología diagnóstica (mamografía, ecografía, resonancia) y seguimiento.',
        color: '#F57C00'
    },
    {
        name: 'Anatomía patológica',
        description: 'Diagnóstico histológico, grado tumoral y biomarcadores (ER, PR, HER2).',
        color: '#E64A19'
    },
    {
        name: 'Medicina nuclear',
        description: 'Estudios como PET/CT y ganglio centinela para estadificación y seguimiento.',
        color: '#5D4037'
    },
    {
        name: 'Pediatría oncológica',
        description: 'En casos raros de cáncer de mama en adolescentes o pacientes pediátricos.',
        color: '#8D6E63'
    },
    {
        name: 'Trabajo social',
        description: 'Gestión de soporte económico, transporte, acompañamiento familiar y vinculación con programas.',
        color: '#607D8B'
    }
]

//Condiciones medicas que pueden afectar o complicar el tratamiento del cancer de mama
const Allergies = [
    {name: 'Chocolate', description: 'Reacción adversa al consumir chocolate.'},
    {name: 'Frutos secos', description: 'Reacción adversa al consumir frutos secos como nueces, almendras, etc.'},
    {name: 'Mariscos', description: 'Reacción adversa al consumir mariscos como camarones, cangrejos, etc.'},
    {name: 'Lácteos', description: 'Reacción adversa al consumir productos lácteos como leche, queso, etc.'},
    {name: 'Gluten', description: 'Reacción adversa al consumir alimentos que contienen gluten como trigo, cebada, etc.'},
    {name: 'Huevos', description: 'Reacción adversa al consumir huevos.'},
    {name: 'Soja', description: 'Reacción adversa al consumir productos de soja.'},
    {name: 'Cacahuates', description: 'Reacción adversa al consumir cacahuates.'},
    {name: 'Pescado', description: 'Reacción adversa al consumir pescado.'},
    {name: 'Polen', description: 'Reacción adversa al polen de plantas.'},
    {name: 'Ácaros del polvo', description: 'Reacción adversa a los ácaros del polvo.'},
    {name: 'Picaduras de insectos', description: 'Reacción adversa a las picaduras de insectos como mosquitos, avispas, etc.'},
    {name: 'Látex', description: 'Reacción adversa al contacto con productos de látex.'},
    {name: 'Animales', description: 'Reacción adversa al contacto con animales como gatos, perros, etc.'},
    {name: 'Moho', description: 'Reacción adversa al moho presente en ambientes húmedos.'},
    {name: 'Perfumes', description: 'Reacción adversa a ciertos perfumes o fragancias.'},
];
//Condiciones medicas que pueden afectar o complicar el tratamiento del cancer de mama
const MedicalConditions = [
    { name: 'Diabetes', description: 'Condición crónica que afecta la forma en que el cuerpo procesa el azúcar en la sangre.'},
    { name: 'Hipertensión', description: 'Condición en la cual la presión arterial se encuentra elevada de manera persistente.'},
    { name: 'Asma', description: 'Enfermedad respiratoria crónica que causa dificultad para respirar debido a la inflamación de las vías respiratorias.'},
    { name: 'Alergias', description: 'Reacciones adversas del sistema inmunológico a sustancias normalmente inofensivas.'},
    { name: 'Enfermedad cardíaca', description: 'Conjunto de trastornos que afectan el corazón y los vasos sanguíneos.'},
    { name: 'Cáncer', description: 'Grupo de enfermedades caracterizadas por el crecimiento descontrolado de células anormales en el cuerpo.'},
    { name: 'Obesidad', description: 'Condición médica en la cual una persona tiene un exceso de grasa corporal que puede afectar su salud.'},
    { name: 'Depresión', description: 'Trastorno del estado de ánimo que causa sentimientos persistentes de tristeza y pérdida de interés en actividades.'},
    { name: 'Ansiedad', description: 'Trastorno caracterizado por sentimientos excesivos de preocupación, miedo o nerviosismo.'},
    { name: 'Enfermedad renal', description: 'Condición que afecta la función normal de los riñones.'},
    { name: 'Artritis', description: 'Inflamación de las articulaciones que causa dolor y rigidez.'},
    { name: 'Epilepsia', description: 'Trastorno neurológico caracterizado por convulsiones recurrentes.'},
    { name: 'Enfermedad pulmonar obstructiva crónica (EPOC)', description: 'Grupo de enfermedades pulmonares que dificultan la respiración.'},
    { name: 'Osteoporosis', description: 'Condición en la cual los huesos se vuelven frágiles y propensos a fracturas.'},
    { name: 'Enfermedad hepática', description: 'Trastornos que afectan la función normal del hígado.'},
    { name: 'Trastornos de la tiroides', description: 'Condiciones que afectan la glándula tiroides y su producción de hormonas.'},
    { name: 'Trastornos autoinmunes', description: 'Enfermedades en las cuales el sistema inmunológico ataca por error los tejidos del propio cuerpo.'},
    { name: 'Trastornos del sueño', description: 'Condiciones que afectan la calidad, cantidad o patrones del sueño.'},
    { name: 'Enfermedad inflamatoria intestinal', description: 'Trastornos crónicos que causan inflamación del tracto digestivo.'},
    { name: 'Trastornos de la coagulación', description: 'Condiciones que afectan la capacidad del cuerpo para formar coágulos sanguíneos de manera adecuada.'},
    { name: 'Fibromialgia', description: 'Trastorno caracterizado por dolor musculoesquelético generalizado y fatiga.'},
    { name: 'Demencia', description: 'Pérdida progresiva de la memoria y otras funciones cognitivas, que puede interferir con el seguimiento del tratamiento.' },
    { name: 'Esquizofrenia', description: 'Trastorno mental grave que puede afectar la percepción de la realidad, dificultando el cumplimiento terapéutico.' },
    { name: 'Delirio', description: 'Estado de confusión aguda y fluctuante, común en pacientes hospitalizados o con metástasis cerebrales.' },
    { name: 'Síndrome metabólico', description: 'Conjunto de condiciones como hipertensión, hiperglucemia, dislipidemia y obesidad que aumentan el riesgo de complicaciones.' },
    { name: 'Dislipidemia', description: 'Alteración en los niveles de lípidos en sangre, que puede interferir con tratamientos cardiovasculares u hormonales.' },
    { name: 'Inmunodeficiencia', description: 'Deficiencia del sistema inmunológico, ya sea congénita o adquirida, que aumenta la susceptibilidad a infecciones durante el tratamiento.' },
    { name: 'Anemia', description: 'Disminución de glóbulos rojos o hemoglobina, lo cual puede agravar la fatiga e influir en la tolerancia a tratamientos oncológicos.' },
    { name: 'Trombocitopenia', description: 'Bajo recuento de plaquetas en sangre, lo que incrementa el riesgo de sangrado con ciertos tratamientos o cirugías.' },
    { name: 'Insuficiencia cardíaca congestiva', description: 'Incapacidad del corazón para bombear sangre de forma eficiente, puede limitar ciertos tratamientos como antraciclinas.' },
    { name: 'Trombosis venosa profunda (TVP)', description: 'Formación de coágulos sanguíneos en las extremidades, frecuente en pacientes con cáncer y asociado a inmovilidad o quimioterapia.' },
    { name: 'Apnea del sueño', description: 'Trastorno respiratorio que interrumpe el sueño, asociado a riesgos cardiovasculares y fatiga crónica.' },
    { name: 'VIH/SIDA', description: 'Virus que debilita el sistema inmunológico, afectando el tipo y momento del tratamiento oncológico.' },
    { name: 'Hepatitis crónica B o C', description: 'Infección viral persistente del hígado que puede limitar el uso de tratamientos hepatotóxicos en oncología.' }
];
//Factores de riesgo asociados al cáncer de mama
const RiskFactors = [
    { name: 'Edad avanzada', description: 'El riesgo de cáncer de mama aumenta con la edad, especialmente después de los 50 años.', risk: 20 },
    { name: 'Antecedentes familiares', description: 'Tener familiares cercanos con cáncer de mama incrementa el riesgo.', risk: 25 },
    { name: 'Mutaciones genéticas', description: 'Mutaciones en genes como BRCA1 y BRCA2 aumentan significativamente el riesgo.', risk: 30 },
    { name: 'Exposición a radiación', description: 'La exposición previa a radiación en el área del pecho puede aumentar el riesgo.', risk: 25 },
    { name: 'Terapia hormonal', description: 'El uso prolongado de terapia hormonal para la menopausia puede incrementar el riesgo.', risk: 12 },
    { name: 'Obesidad', description: 'El exceso de peso, especialmente después de la menopausia, está asociado con un mayor riesgo.', risk: 20 },
    { name: 'Consumo de alcohol', description: 'El consumo excesivo de alcohol se ha relacionado con un mayor riesgo de cáncer de mama.', risk: 10 },
    { name: 'Falta de actividad física', description: 'La inactividad física puede contribuir al aumento del riesgo.', risk: 10 },
    { name: 'Dieta poco saludable', description: 'Una dieta alta en grasas saturadas y baja en frutas y verduras puede aumentar el riesgo.', risk: 8 },
    { name: 'Menarquia temprana', description: 'Comenzar la menstruación a una edad temprana (antes de los 12 años) puede aumentar el riesgo.', risk: 10 },
    { name: 'Menopausia tardía', description: 'Tener la menopausia después de los 55 años puede incrementar el riesgo.', risk: 12 },
    { name: 'No haber tenido hijos', description: 'Las mujeres que no han tenido hijos o que tuvieron su primer hijo después de los 30 años tienen un mayor riesgo.', risk: 10 },
    { name: 'Lactancia materna', description: 'No amamantar o hacerlo por períodos cortos puede aumentar el riesgo.', risk: 5 },
    { name: 'Consumo de tabaco', description: 'El consumo regular de tabaco o fumar durante largos periodos puede aumentar el riesgo de cáncer de mama.', risk: 10 },
    { name: 'Vida sedentaria', description: 'La falta prolongada de actividad física contribuye a un mayor riesgo de desarrollar cáncer de mama.', risk: 8 },
    { name: 'Dieta alta en grasas', description: 'Una alimentación rica en grasas saturadas se asocia con un incremento del riesgo.', risk: 8 },
    { name: 'Historia de radioterapia en el pecho', description: 'Haber recibido tratamientos de radioterapia en la zona torácica a una edad temprana incrementa el riesgo en la edad adulta.', risk: 30 },
    { name: 'Antecedentes de enfermedad benigna de mama', description: 'Ciertas condiciones benignas como hiperplasia atípica pueden elevar el riesgo de desarrollar cáncer de mama.', risk: 30 }
];
//Síntomas asociados al cáncer de mama avanzado o metastásico
const Symptoms = [
    { name: 'Dolor óseo persistente', description: 'Dolor continuo en huesos o articulaciones.', severity: 2 },
    { name: 'Hinchazón en el pecho', description: 'Inflamación visible en el área del pecho.', severity: 2 },
    { name: 'Bulto nuevo en el pecho', description: 'Masa o protuberancia palpable en el pecho.', severity: 2 },
    { name: 'Dolor en el pecho', description: 'Molestia o presión en la zona torácica.', severity: 2 },
    { name: 'Dificultad para respirar', description: 'Sensación de falta de aire.', severity: 2 },
    { name: 'Tos persistente', description: 'Tos continua que se mantiene por días.', severity: 1 },
    { name: 'Voz ronca persistente', description: 'Cambio prolongado en el tono de la voz.', severity: 1 },
    { name: 'Dolores de cabeza fuertes', description: 'Dolor intenso en la cabeza.', severity: 2 },
    { name: 'Dolores de cabeza recurrentes', description: 'Dolor de cabeza que se repite frecuentemente.', severity: 2 },
    { name: 'Mareos persistentes', description: 'Sensación recurrente de inestabilidad.', severity: 3 },
    { name: 'Pérdida de equilibrio', description: 'Dificultad para mantener la estabilidad corporal.', severity: 3 },
    { name: 'Confusión o desorientación', description: 'Alteraciones en la claridad mental.', severity: 3 },
    { name: 'Náuseas persistentes', description: 'Sensación continua de malestar estomacal.', severity: 1 },
    { name: 'Pérdida del apetito', description: 'Disminución del interés por comer.', severity: 1 },
    { name: 'Pérdida de peso no explicada', description: 'Reducción de peso sin intención.', severity: 2 },
    { name: 'Dolor abdominal', description: 'Molestia en la zona del abdomen.', severity: 2 },
    { name: 'Sensación de llenura constante', description: 'Sensación continua de estar lleno.', severity: 2 },
    { name: 'Ictericia', description: 'Coloración amarillenta en piel u ojos.', severity: 3 },
    { name: 'Hinchazón en brazos', description: 'Aumento de volumen en uno o ambos brazos.', severity: 1 },
    { name: 'Hinchazón en piernas', description: 'Aumento de volumen en una o ambas piernas.', severity: 1 },
    { name: 'Dolor lumbar persistente', description: 'Dolor continuo en la zona baja de la espalda.', severity: 2 },
    { name: 'Cambios en la piel del pecho', description: 'Alteraciones visibles en la textura o color de la piel del pecho.', severity: 2 },
    { name: 'Fatiga extrema', description: 'Cansancio intenso que afecta actividades diarias.', severity: 1 },
    { name: 'Dolor en costillas', description: 'Dolor localizado en la zona de las costillas.', severity: 2 },
    { name: 'Dificultad para mover el torso', description: 'Limitación en la movilidad del tronco.', severity: 2 }
];


//Estados de las citas médicas
const AppointmentStatuses = [
    { name: 'Confirmada por el Paciente',   color: '#ffc400', patient: 1, doctor: 0 },
    { name: 'Confirmada por el Médico',     color: '#ffa600', patient: 0, doctor: 1 },
    { name: 'Cancelada por Paciente',       color: '#F44336', patient: 2, doctor: 1 },
    { name: 'Cancelada por Médico',         color: '#ff1100', patient: 1, doctor: 2 },
    { name: 'Reprogramada por Paciente',    color: '#27a5f4', patient: 3, doctor: 1 },
    { name: 'Reprogramada por Médico',      color: '#008fff', patient: 1, doctor: 3 },
    { name: 'Confirmada por Ambos',         color: '#4CAF50', patient: 1, doctor: 1 },
]
const AppointmentMethods = [
    { name: 'Consulta presencial',    color: '#4CAF50', requiresRoom: true },         // verde
    { name: 'Videollamada',           color: '#2196F3', requiresRoom: false },               // azul
    { name: 'Seguimiento telefónico', color: '#9C27B0', requiresRoom: false },     // naranja
    { name: 'Consulta domiciliaria',  color: '#FF9800', requiresRoom: false },      // morado
    { name: 'Toma de muestras',       color: '#F44336', requiresRoom: true }             // rojo
]

//Roles de los usuarios en el sistema
const Roles = [
    { name: 'Paciente' },
    { name: 'Doctor' },
    { name: 'Administrador' },
    { name: 'Sistema' }
]

//Niveles de severidad para las notificaciones
const NotificationSeverities = [
    { name: 'Información', code: 'info',      color: '#2196F3' },
    { name: 'Éxito',       code: 'success',   color: '#4CAF50' },
    { name: 'Advertencia', code: 'warn',      color: '#FF9800' },
    { name: 'Peligro',     code: 'error',     color: '#F44336' },
    { name: 'Contraste',   code: 'contrast',  color: 'var(--primary)' },
    { name: 'Secundario',  code: 'secondary', color: 'var(--secondary)' },
]

//Datos de Demostración
const Users = [
    {
        roleId: 1,
        dniCe: '00000001',
        name: 'Paciente de',
        lastname: 'Prueba',
        birthdate: '1990-01-01',
        sex: true,
        email: 'patient@gmail.com',
        phone: '+51942232674',
        username: 'patient',
        hashPassword: bcrypt.hash('patient', salt),
        weight: 69,
        height: 1.60
    },
    {
        roleId: 2,
        dniCe: '00000010',
        name: 'Doctor de',
        lastname: 'Prueba',
        birthdate: '1990-01-01',
        sex: true,
        email: 'doctor@gmail.com',
        phone: '999555999',
        username: 'doctor',
        hashPassword: bcrypt.hash('doctor', salt),
        universityId: 1,
        egresate_date: '2015-12-31',
        specialtyId: 1,
        cpm: '1234566666',
        rne: '6666666666'
    },
    {
        roleId: 3,
        dniCe: '00000000',
        name: 'Administrador del',
        lastname: 'Sistema',
        birthdate: '1990-01-01',
        sex: true,
        email: 'admin@gmail.com',
        phone: '999999999',
        username: 'admin',
        hashPassword: bcrypt.hash('admin', salt)
    },
    {
        roleId: 4,
        dniCe: '66666666',
        name: 'Sistema',
        lastname: 'Cardinal',
        birthdate: '1990-01-01',
        sex: true,
        email: 'system@gmail.com',
        phone: '666666666',
        username: 'system',
        hashPassword: bcrypt.hash('system', salt)
    }
]
const PatientsPerDoctor = [{ patientId: 1, doctorId: 2 }];
const AllergiesPerPatient = [
    { patientId: 1, allergyId: 1 },
    { patientId: 1, allergyId: 2 },
    { patientId: 1, allergyId: 3 }
];
const ConditionsPerPatient = [
    { patientId: 1, conditionId: 1 },
    { patientId: 1, conditionId: 2 },
    { patientId: 1, conditionId: 3 }
];
const RiskFactorsPerPatient = [
    { patientId: 1, riskFactorId: 1 },
    { patientId: 1, riskFactorId: 2 },
    { patientId: 1, riskFactorId: 3 }
];
const SymptomsPerPatient = [
    { patientId: 1, symptomId: 1 },
    { patientId: 1, symptomId: 2 },
    { patientId: 1, symptomId: 3 }
];
const Notifications = [
    {
        patientId: 1,
        doctorId: 2,
        summary: 'Notificación Azul',
        detail: 'Ejemplo de Notificación Azul',
        severityId: 1
    },
    {
        patientId: 1,
        doctorId: 2,
        summary: 'Notificación Verde',
        detail: 'Ejemplo de Notificación verde',
        severityId: 2
    },
    {
        patientId: 1,
        doctorId: 2,
        summary: 'Notificación Naranja',
        detail: 'Ejemplo de Notificación naranja',
        severityId: 3
    },
    {
        patientId: 1,
        doctorId: 2,
        summary: 'Notificación Roja',
        detail: 'Ejemplo de Notificación roja',
        severityId: 4
    },
    {
        patientId: 1,
        doctorId: 2,
        summary: 'Notificación Contraste',
        detail: 'Ejemplo de Notificación contraste',
        severityId: 5
    },
    {
        patientId: 1,
        doctorId: 2,
        summary: 'Notificación Secundaria',
        detail: 'Ejemplo de Notificación secundaria',
        severityId: 6
    }
];
const DrRooms = [
    { doctorId: 2, name: 'Consultorio Principal',  address: 'Av. Siempre Viva 123, Ciudad' },
    { doctorId: 2, name: 'Consultorio Secundario', address: 'Calle Falsa 456, Ciudad' }
]

if ( JSON.parse(process?.env?.DB_FAKE) ?? false ) {
    const TOTAL = 80;
    console.log('Lista de usuarios falsos:')

    for (let i = 0; i < TOTAL; i++) {
        const username = faker.internet.username();
        const password = faker.internet.password();

        const patient = {
            roleId: 1,
            dniCe: faker.string.numeric(8),
            name: faker.person.firstName(),
            lastname: faker.person.lastName(),
            birthdate: faker.date.birthdate({ min: 1940, max: 2001, mode: 'age' })
                .toISOString().split('T')[0],
            sex: faker.datatype.boolean(),
            email: faker.internet.email(),
            phone: faker.phone.number({style: 'national'}),
            username,
            hashPassword: bcrypt.hashSync(password, salt),
            weight: faker.number.float({ min: 40, max: 150, precision: 0.1 }),
            height: faker.number.float({ min: 1.40, max: 1.95, precision: 0.01 })
        };
        Users.push(patient);
        const threshold = 0.6 + Math.random() * 0.6;
        Allergies.forEach((allergy, index) => {
            if (Math.random() > threshold) AllergiesPerPatient.push({ patientId: Users.length, allergyId: index + 1 });
        });
        MedicalConditions.forEach((condition, index) => {
            if (Math.random() > threshold) ConditionsPerPatient.push({ patientId: Users.length, conditionId: index + 1 });
        });
        RiskFactors.forEach((risk, index) => {
            if (Math.random() > threshold) RiskFactorsPerPatient.push({ patientId: Users.length, riskFactorId: index + 1 });
        });
        Symptoms.forEach((symptom, index) => {
            if (Math.random() > threshold) SymptomsPerPatient.push({ patientId: Users.length, symptomId: index + 1 });
        });
        console.log(`${username}|${password}`);
    }
}

module.exports = {
    Universities,
    Specialties,
    Allergies,
    MedicalConditions,
    RiskFactors,
    AppointmentStatuses,
    AppointmentMethods,
    NotificationSeverities,
    Symptoms,
    Roles,

    Users,
    PatientsPerDoctor,
    AllergiesPerPatient,
    ConditionsPerPatient,
    RiskFactorsPerPatient,
    SymptomsPerPatient,
    Notifications,
    DrRooms,
}