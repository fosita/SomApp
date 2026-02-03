<script>
import {RouterLink, RouterView} from 'vue-router';
import router from "@/router/index.js";
import routes from "@/router/abstract.routes.js";
import userRoles from "@/shared/data/user.roles.js";
import toasts from "@/services/toasts/toast.messages.service.js";
import getUniversities from "@/services/universities/get.universities.service.js";
import getSpecialities from "@/services/specialities/get.specialities.service.js";
import getAppointmentMethods from "@/services/appointments/get.appointment.methods.service.js";
import getAppointmentStatuses from "@/services/appointments/get.appointment.statuses.service.js";
import getAllergies from "@/services/allergies/get.allergies.service.js";
import getSymptoms from "@/services/symptoms/get.symptoms.service.js";
import getConditions from "@/services/conditions/get.conditions.service.js";
import getRiskFactors from "@/services/risk.factors/get.risk.factors.service.js";
import getNotificationSeverities from "@/services/notifications/get.notification.severities.service.js";

export default {
    components: {
        RouterLink,
        RouterView
    },
    data() {
        return {
            doctor: null,
            patient: null,

            universities: null,
            specialities: null,
            appointmentMethods: null,
            appointmentStatuses: null,
            allergies: null,
            conditions: null,
            risks: null,
            notificationSeverities: null,

            // check If Browser default is dark mode
            dark: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
            route: null,
            routes,
            loading: true,
        }
    },
    methods: {
        back(){ router.back(); },
        goToWelcome(){
            this.route = routes.welcome;
            router.push(this.route)
        },
        goToLogin(){
            this.route = routes.login;
            router.push(this.route)
        },
        assignUserOnRole(user) {
            switch (user.roleId) {
                case userRoles.doctor:
                    this.doctor = user;
                    this.patient = null;
                    this.route = routes.doctorProfile;
                    break;

                case userRoles.patient:
                    this.patient = user;
                    this.doctor = null;
                    this.route = routes.patientProfile;
                    break;

                default: return this.logout()
            }
        },
        login(user = null) {
            if (!user) return this.goToLogin();

            this.assignUserOnRole(user);

            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("authToken", user.token);
            router.push(this.route)
        },
        logout(errorToast = null) {
            if(errorToast) this.$toast.add(errorToast);
            localStorage.removeItem("user");
            localStorage.removeItem("authToken");
            this.patient = null;
            this.doctor = null;
            this.route = routes.welcome;
            return router.push(this.route)
        },
        register() {
            this.route = routes.register;
            router.push(this.route)
        },
        patientCreator(){
            this.route = routes.patientCreator;
            router.push(this.route)
        },
        doctorCreator(){
            this.route = routes.doctorCreator;
            router.push(this.route)
        },

        patientSelected(patient, enter = false) {
            console.log(patient);
            this.patient = patient;
            if(enter) this.patientViewer()
        },
        patientSelector(showError = false) {
            if(showError) this.$toast.add(toasts.noPatientSelected);
            this.patient = null;
            this.route = routes.doctorPatientSelector;
            router.push(this.route)
        },
        patientViewer() {
            if(!this.patient) return this.patientSelector(true);
            this.route = routes.doctorProfile;
            router.push(this.route)
        },
        patientChatViewer() {
            if(!this.patient) return this.patientSelector(true);
            this.route = routes.doctorPatientChatViewer;
            router.push(this.route)
        },
        profile() {
            if(this.doctor){ this.route = routes.doctorProfile }
            else if(this.patient){ this.route = routes.patientProfile }
            else { return this.logout(toasts.noSession) }
            router.push(this.route)
        },
        goToRooms() {
            if(!this.doctor) return this.logout(toasts.noSession);
            this.route = routes.doctorRooms;
            router.push(this.route)
        },
        goToAllergies() {
            this.route = routes.patientAllergies;
            router.push(this.route)
        },
        goToConditions() {
            this.route = routes.patientMedicalConditions
            router.push(this.route)
        },
        goToRisks(){
            this.route = routes.patientRiskFactors
            router.push(this.route)
        },
        goToSymptoms(){
            this.route = routes.patientSymptoms
            router.push(this.route)
        },
        chat() {
            if(this.doctor) return this.patientChatViewer();
            else if(this.patient) this.route = routes.patientChat;
            else return this.logout(toasts.noSession)

            router.push(this.route)
        },
        notifications(){
            if(this.doctor) this.route = routes.doctorPatientNotificationsViewer;
            else if(this.patient) this.route = routes.patientNotifications;
            else return this.logout(toasts.noSession)
            router.push(this.route)
        },
        appointments(){
            if(this.doctor) this.route = routes.doctorPatientAppointmentsViewer;
            else if(this.patient) this.route = routes.patientAppointments;
            else return this.logout(toasts.noSession)
            router.push(this.route)
        },
        declareRoute(route){ this.route = route },
        tryRestore() {
            try {
                const lastSync = JSON.parse(localStorage.getItem("lastSync"));
                const oneDay = 24 * 60 * 60 * 1000;
                const now = Date.now();

                if (!lastSync || (now - lastSync) > oneDay)
                    return console.error('Los datos almacenados han expirado.');

                const items = {
                    universities: "universidades",
                    specialities: "especialidades",
                    appointmentMethods: "métodos de cita",
                    appointmentStatuses: "estados de cita",
                    notificationSeverities: "niveles de severidad",
                    allergies: "alergias",
                    conditions: "condiciones",
                    risks: "factores de riesgo",
                    symptoms: "síntomas"
                };

                for (const key in items) {
                    const raw = localStorage.getItem(key);
                    if (!raw) return console.error(`${items[key]} no existe en localStorage`);
                    this[key] = JSON.parse(raw);
                    if (!Array.isArray(this[key])) return console.error(`${items[key]} no es un arreglo.`);
                }

                console.log('✅ Datos restaurados exitosamente desde localStorage');
                return true;
            } catch (error) { return console.error('Error al restaurar caché:', error) }
            finally { // Si algo falló, aseguramos que los datos estén vacíos
                if (!this.universities || !Array.isArray(this.universities)) this.universities = [];
                if (!this.specialities || !Array.isArray(this.specialities)) this.specialities = [];

                if (!this.appointmentMethods || !Array.isArray(this.appointmentMethods))
                    this.appointmentMethods = [];
                if (!this.appointmentStatuses || !Array.isArray(this.appointmentStatuses))
                    this.appointmentStatuses = [];
                if (!this.notificationSeverities || !Array.isArray(this.notificationSeverities))
                    this.notificationSeverities = [];

                if (!this.allergies || !Array.isArray(this.allergies)) this.allergies = [];
                if (!this.conditions || !Array.isArray(this.conditions)) this.conditions = [];
                if (!this.risks || !Array.isArray(this.risks)) this.risks = [];
                if (!this.symptoms || !Array.isArray(this.symptoms)) this.symptoms = [];
            }
        },
        async initData(){
            try {
                //Intenta cargar de localStorage
                if(this.tryRestore()) return;

                const universities = await getUniversities();
                if(universities.error) return this.$toast.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se pudieron cargar las universidades',
                    life: 5000
                });
                this.universities = universities.response;
                
                const specialities = await getSpecialities();
                if(specialities.error) return this.$toast.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se pudieron cargar las especialidades',
                    life: 5000
                });
                this.specialities = specialities.response;

                const appointmentMethods = await getAppointmentMethods();
                if(appointmentMethods.error) return this.$toast.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se pudieron cargar los métodos de cita',
                    life: 5000
                });
                this.appointmentMethods = appointmentMethods.response;

                const appointmentStatuses = await getAppointmentStatuses();
                if(appointmentStatuses.error) return this.$toast.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se pudieron cargar los estados de cita',
                    life: 5000
                });
                this.appointmentStatuses = appointmentStatuses.response;

                const notificationSeverities = await getNotificationSeverities();
                if(notificationSeverities.error) return this.$toast.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se pudieron cargar las severidades de notificación',
                    life: 5000
                });
                this.notificationSeverities = notificationSeverities.response;

                const allergies = await getAllergies();
                if(allergies.error) return this.$toast.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se pudieron cargar las alergias',
                    life: 5000
                });
                this.allergies = allergies.response;

                const conditions = await getConditions();
                if(conditions.error) return this.$toast.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se pudieron cargar las condiciones médicas',
                    life: 5000
                });
                this.conditions = conditions.response;

                const risks = await getRiskFactors();
                if(risks.error) return this.$toast.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se pudieron cargar los factores de riesgo',
                    life: 5000
                });
                this.risks = risks.response;

                const symptoms = await getSymptoms();
                if(symptoms.error) return this.$toast.add({
                    severity: 'warn',
                    summary: 'Advertencia',
                    detail: 'No se pudieron cargar los síntomas',
                    life: 5000
                });
                this.symptoms = symptoms.response;

                //Guarda en localStorage
                localStorage.setItem("lastSync", JSON.stringify(Date.now()));

                localStorage.setItem("universities", JSON.stringify(this.universities));
                localStorage.setItem("specialities", JSON.stringify(this.specialities));
                
                localStorage.setItem("appointmentMethods", JSON.stringify(this.appointmentMethods));
                localStorage.setItem("appointmentStatuses", JSON.stringify(this.appointmentStatuses));
                localStorage.setItem("notificationSeverities", JSON.stringify(this.notificationSeverities));

                localStorage.setItem("allergies", JSON.stringify(this.allergies));
                localStorage.setItem("conditions", JSON.stringify(this.conditions));
                localStorage.setItem("risks", JSON.stringify(this.risks));
                localStorage.setItem("symptoms", JSON.stringify(this.symptoms));

            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error al inicializar',
                    detail: error.message?error.message:'No se pudieron cargar los datos iniciales de la aplicación',
                    life: 7000
                });
            } finally { this.loading = false }
        }
    },
    //If browser default is updated, update dark mode
    created() {
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', e => { this.dark = e.matches})

        const user = localStorage.getItem('user')
        if(user) this.login(JSON.parse(user))
        else this.goToWelcome();

        this.initData()
    },
}
</script>

<template>
    <Toast/>
    <ConfirmDialog group="html">
        <template #message="slotProps">
            <div v-html="slotProps.message.message"/>
        </template>
    </ConfirmDialog>
    <header v-if="false" class="flex row row-justify-center padding-1" @click="profile">
        <div class="flex col center" v-if="route !== routes.profile">
            <i class="pi pi-chevron-left text-button"/>
        </div>
        <div class="flex col center max-width" style="user-select: none">
            <div class="white font-32px text-shadow">Dr. Beat</div>
            <div class="white font-9px text-shadow">Your nutritional AI solution</div>
        </div>
        <div class="flex col center" v-if="route !== routes.profile">
            <i class="pi pi-chevron-left transparent"/>
        </div>
    </header>
    <div class="login-background" v-if="(!patient && !doctor) || route === routes.patientCreator || loading"/>
    <div class="app-background" v-else/>
    <main class="fullscreen flex col col-top-center overflow-auto">
        <div class="flex col col-top-center margin-auto">
            <div class="" v-if="loading">
                <div class="white flex col center">
                    <ProgressSpinner strokeWidth="5" class="text-shadow"/>
                    <p class="font-20px text-shadow margin-top-0-5" style="font-weight: 500">Inicializando</p>
                    <p class="font-24px text-shadow margin-top--0-8" style="font-weight: 500">Aplicación</p>
                </div>
            </div>
            <RouterView v-else @welcome="goToWelcome" @back="back" @declareRoute="declareRoute"
                        @login="login" @logout="logout" @register="register" @profile="profile"
                        @patientCreator="patientCreator" @doctorCreator="doctorCreator"
                        @patientSelector="patientSelector" @patientSelected="patientSelected"
                        @allergies="goToAllergies" @conditions="goToConditions" @risks="goToRisks"
                        @symptoms="goToSymptoms"                         @doctorRooms="goToRooms"
                        @notifications="notifications" @appointments="appointments" @chat="chat"

                        :doctor="doctor" :patient="patient" :dark="dark"
                        :allergies="allergies" :conditions="conditions" :risks="risks" :symptoms="symptoms"
                        :universities="universities" :specialities="specialities"
                        :appointmentStatuses="appointmentStatuses"
                        :appointmentMethods="appointmentMethods"
                        :notificationSeverities="notificationSeverities"/>
        </div>
    </main>
</template>

<style scoped>
.text-shadow { text-shadow: 4px 4px 4px rgba(0, 0, 0, 0.25);}
.box-shadow { box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.25); }
</style>