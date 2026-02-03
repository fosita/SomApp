import {createRouter, createWebHistory} from 'vue-router'
import welcomeView from "@/views/authentication/welcome.view.vue";
import loginView from "@/views/authentication/login.view.vue";
import registerView from "@/views/authentication/register.view.vue";
import patientProfileView from "@/views/patient/patient.profile.view.vue";
import ChatView from "@/views/chat/chat.view.vue";
import abstractRoutes from "@/router/abstract.routes.js";
import patientSelectorView from "@/views/doctor/patients/patient.selector.view.vue";
import allergiesView from "@/views/patient/constraints/allergies.view.vue";
import medicalConditionsView from "@/views/patient/constraints/medical.conditions.view.vue";
import doctorProfileView from "@/views/doctor/doctor.profile.view.vue";
import doctorCreatorView from "@/views/doctor/doctor.creator.view.vue";
import patientCreatorView from "@/views/patient/patient.creator.view.vue";
import notificationsView from "@/views/notifications/notifications.view.vue";
import appointmentCalendarView from "@/views/appointments/appointment.calendar.view.vue";
import doctorRoomsView from "@/views/doctor/rooms/doctor.rooms.view.vue";
import riskFactorsView from "@/views/patient/constraints/risk.factors.view.vue";
import symptomsView from "@/views/patient/constraints/symptoms.view.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            ...abstractRoutes.welcome,
            component: welcomeView,
        },
        {
            ...abstractRoutes.login,
            component: loginView,
        },
        {
            ...abstractRoutes.register,
            component: registerView
        },




        {
            ...abstractRoutes.doctorCreator,
            component: doctorCreatorView
        },
        {
            ...abstractRoutes.doctorProfile,
            component: doctorProfileView,
        },
        {
            ...abstractRoutes.doctorPatientSelector,
            component: patientSelectorView
        },
        {
            ...abstractRoutes.doctorPatientViewer,
            component: patientProfileView,
        },
        {
            ...abstractRoutes.doctorPatientChatViewer,
            component: ChatView
        },
        {
            ...abstractRoutes.doctorPatientNotificationsViewer,
            component: notificationsView
        },
        {
            ...abstractRoutes.doctorPatientAppointmentsViewer,
            component: appointmentCalendarView
        },
        {
            ...abstractRoutes.doctorRooms,
            component: doctorRoomsView
        },




        {
            ...abstractRoutes.patientCreator,
            component: patientCreatorView,
        },
        {
            ...abstractRoutes.patientProfile,
            component: patientProfileView,
        },
        {
            ...abstractRoutes.patientChat,
            component: ChatView,
        },
        {
            ...abstractRoutes.patientAllergies,
            component: allergiesView,
        },
        {
            ...abstractRoutes.patientMedicalConditions,
            component: medicalConditionsView,
        },
        {
            ...abstractRoutes.patientRiskFactors,
            component: riskFactorsView,
        },
        {
            ...abstractRoutes.patientSymptoms,
            component: symptomsView,
        },
        {
            ...abstractRoutes.patientNotifications,
            component: notificationsView
        },
        {
            ...abstractRoutes.patientAppointments,
            component: appointmentCalendarView
        },




        {
            path: '/:pathMatch(.*)*',
            redirect: {name: abstractRoutes.welcome.name}
        }
    ],
})

export default router
