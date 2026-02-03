const routes = {
    welcome: {
        value: 1,
        path: '/',
        name: 'welcome'
    },
    login: {
        value: 2,
        path: '/login',
        name: 'login'
    },
    register: {
        value: 3,
        path: '/register',
        name: 'register type selector'
    },



    doctorCreator: {
        value: 100,
        path: '/doctor/create',
        name: 'register doctor'
    },
    doctorProfile: {
        value: 110,
        path: '/doctor/profile',
        name: 'doctor profile'
    },
    doctorPatientSelector: {
        value: 120,
        path: '/doctor/patients/select',
        name: 'select patient'
    },
    doctorPatientViewer: {
        value: 121,
        path: `/doctor/patients/selected`,
        name: 'view patient'
    },
    doctorPatientChatViewer: {
        value: 122,
        path: `/doctor/patients/selected/chat`,
        name: 'view patient chat'
    },
    doctorPatientNotificationsViewer: {
        value: 130,
        path: `/doctor/patients/selected/notifications/`,
        name: 'view patient notifications',
    },
    doctorPatientAppointmentsViewer: {
        value: 140,
        path: `/doctor/patients/selected/appointments/`,
        name: 'view patient appointments',
    },
    doctorRooms: {
        value: 150,
        path: '/doctor/rooms',
        name: 'doctor rooms'
    },


    patientCreator: {
        value: 200,
        path: '/patient/create',
        name: 'register patient'
    },
    patientProfile: {
        value: 210,
        path: '/patient/profile',
        name: 'patient profile'
    },
    patientChat: {
        value: 220,
        path: '/patient/chat',
        name: 'chat'
    },
    patientAnthropometric: {
        value: 230,
        path: '/patient/anthropometric',
        name: 'anthropometric'
    },
    patientAllergies: {
        value: 231,
        path: '/patient/allergies',
        name: 'allergies'
    },
    patientMedicalConditions: {
        value: 232,
        path: '/patient/medicalConditions',
        name: 'medical conditions'
    },
    patientRiskFactors: {
        value: 233,
        path: '/patient/risk_factors',
        name: 'risk factors'
    },
    patientSymptoms: {
        value: 234,
        path: '/patient/symptoms',
        name: 'symptoms'
    },
    patientNotifications: {
        value: 240,
        path: '/patient/notifications',
        name: 'notifications'
    },
    patientAppointments: {
        value: 250,
        path: '/patient/appointments',
        name: 'appointments'
    }
}
export default routes;