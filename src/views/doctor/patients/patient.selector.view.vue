<script>
import toastMessages from "@/services/toasts/toast.messages.service.js";
import sexes from "@/services/patients/sexes.values.js";
import linkPatientToDoctor from "@/services/doctors/link.patient.service.js";
import unlinkPatientFromDoctor from "@/services/doctors/unlink.patient.service.js";
import getPatientsPerDoctor from "@/services/doctors/get.patients.per.doctor.js";
import abstractRoutes from "@/router/abstract.routes.js";
import {HttpStatusCode} from "axios";

export default {
    name: "patients selector",
    components: {},
    props: { doctor: Object, patient: Object },
    methods: {
        handleError(error, summary = null, detail = null){
            console.error(error, summary, detail);
            this.$toast.add({
                severity: 'error',
                summary: summary ?? 'Error',
                detail: error.error ?? detail ?? 'Ocurrió un error inesperado.',
                life: 5000,
            });
            if(error.statusCode === HttpStatusCode.Unauthorized)
                return this.$emit('logout')
            return this.$emit('profile')
        },
        async loadPatients(){
            try {
                const res = await getPatientsPerDoctor(this.doctor.id);
                if (res.error) return this.handleError(res, "Error al cargar pacientes");
                this.$toast?.add(toastMessages.patientsLoaded(this.doctor));
                this.patients = res.response;
            } finally { this.loading = false }
        },
        askToUnlink(patient){
            if(!patient) return;
            this.$confirm.require({
                group: 'html',
                message: `¿Estás seguro de que deseas dejar de ser el médico de ${patient.name} ${patient.lastname}?`,
                header: 'Confirmar Desvinculación',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Desvincular',
                rejectLabel: 'Cancelar',
                rejectClass: 'p-button-secondary',
                accept: () => { this.unlink(patient); },
                reject: () => {
                    this.$toast?.add({
                        severity: 'info',
                        summary: 'Acción cancelada',
                        detail: 'No se ha realizado ningún cambio',
                        life: 3000
                    });
                }
            });
        },
        async link(){
            try {
                this.processing = true;
                const res = await linkPatientToDoctor(this.patientToLink, this.doctor.id);
                if (res.error) return this.handleError(res, "Error al vincular paciente");
                this.$toast?.add({
                    severity: 'success',
                    summary: 'Vinculación exitosa',
                    detail: 'El paciente se ha vinculado exitosamente',
                    life: 4000
                });
                this.showDialog = false;
                this.patientToLink = null;
                await this.loadPatients()
            } finally { this.processing = false }
        },
        async unlink(patient){
            try {
                this.processing = true;
                const res = await unlinkPatientFromDoctor(this.doctor.id, patient.id);
                if (res.error) return this.handleError(res, "Error al desvincular paciente");
                this.$toast?.add({
                    severity: 'success',
                    summary: 'Desvinculación exitosa',
                    detail: `${patient.name} ${patient.lastname} ha sido desvinculado exitosamente`,
                    life: 4000
                });
                this.patients = this.patients.filter(c => c.id !== patient.id);
                if (this.patient && this.patient.id === patient.id) { this.$emit('patient', null);}
            } finally { this.processing = false; }
        },
        doctorName(){ return `${this.doctor.name} ${this.doctor.lastname}` },
        calcAge(birthdate) {
            const bd = new Date(birthdate);
            if (isNaN(bd)) return null;              // o lanza error
            return new Date(Date.now() - bd).getUTCFullYear() - 1970;
        },
        toStrDate(date) { const d = new Date(date); return d.toLocaleDateString(); },
        getColor(sex){
            if(sex) return 'color: #42A5F5'; // Azul para masculino
            else return 'color: #EC407A'; // Rosa para femenino
        },

    },
    data() {
        return {
            sexes,
            patients: [],
            loading: true,
            showDialog: false,
            processing: false,
            patientToLink: null,
        }
    },
    created() {
        if (!this.doctor) return this.$emit('logout');
        this.loadPatients()
        this.$emit('declareRoute', abstractRoutes.doctorPatientSelector)
    }
}
</script>

<template>
    <div class="flex col center margin-auto gap-1" v-if="loading && doctor">
        <div class="text-center text-gray-500">
            Cargando pacientes de {{ doctorName() }}...
        </div>
        <i class="pi pi-spin pi-spinner font-40"></i>
    </div>
    <div class="flex col center margin-auto gap-1" v-else-if="doctor">
        <h1 class="text-2xl font-bold text-center">Gestión de Pacientes</h1>
        <div class="flex-grow p-4">
            <div v-if="patients.length === 0" class="text-center text-gray-500">
                No hay pacientes registrados. Por favor, añade o vincula un paciente.
            </div>
            <div v-else class="flex row flex-wrap gap-1 center">
                <Card v-for="patient in patients.filter(p => p.roleId === 1)" :key="patient.id">
                    <template #title>
                        <i class="pi pi-circle-fill" :style="getColor(patient.sex)"/>
                        {{ patient.name }} {{ patient.lastname }}
                    </template>
                    <template #content>
                        <div class="flex col margin-bottom-1 col-center-left">
                            <p>ID: {{ patient.id }}</p>
                            <p>Edad: {{ calcAge(patient.birthdate) }} años</p>
                            <p>Nacimiento: {{ toStrDate(patient.birthdate) }}</p>
                            <p>Sexo: {{ sexes.find(s=>s.value === !!patient.sex).label }}</p>
                            <p>Teléfono: {{patient.phone}}</p>
                            <p>Peso: {{patient.weight}} Kg</p>
                            <p>Altura: {{patient.height}} m</p>
                        </div>
                        <div class="flex col gap-0-5 max-width">
                            <Button @click="$emit('patientSelected', patient, true)" fluid
                                    :disabled="processing">
                                Seleccionar
                            </Button>
                            <Button @click="askToUnlink(patient)" fluid severity="secondary"
                                    :disabled="processing">
                                Desvincular
                            </Button>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
        <div class="flex col center gap-0-5 buttons-container">
            <Button @click="$emit('patientCreator')" fluid severity="secondary" :disabled="processing">
                Crear Paciente
            </Button>
            <Button @click="showDialog = true" fluid severity="secondary" :disabled="processing">
                Vincular Paciente
            </Button>
            <Button @click="$emit('profile')" fluid :disabled="processing">
                Volver
            </Button>
        </div>
    </div>

    <Dialog
        v-model:visible="showDialog"
        :modal="true"
        header="Vincular Paciente"
        :style="{ width: '22rem' }"
        :pt="{ root: { class: 'border-radius-1' } }"
        @hide="close"
    >
        <div class="flex col gap-1 center">
            <inputNumber v-model="patientToLink" placeholder="ID del paciente" :min="1" :max="999999" fluid/>
            <div class="flex row gap-0-5 justify-end max-width">
                <Button label="Cancelar" icon="pi pi-times" severity="secondary"
                        :disabled="processing" @click="showDialog = false" type="button" fluid/>
                <Button label="Vincular" icon="pi pi-check" :disabled="processing"
                        @click="link" fluid/>
            </div>
        </div>
    </Dialog>
    <div class="absolute top-0-5 left-0-5">
        <Button icon="pi pi-chevron-left" @click="$emit('profile')" severity="secondary" rounded/>
    </div>
</template>

<style scoped>
.buttons-container{
    width: calc(100vw - 2rem);
    max-width: 16rem;
}
</style>