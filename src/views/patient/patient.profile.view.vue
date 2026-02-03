<script>
import updatePatientData from "@/services/authentication/update.user.service.js";
import Loading from "@/components/loading.component.vue";
import sexes from "@/services/patients/sexes.values.js";
import routes from "@/router/abstract.routes.js";
import toastMessages from "@/services/toasts/toast.messages.service.js";
import anthropometricValues from "@/shared/data/anthropometric.fields.js";
import getPredictions from "@/services/predictions/get.predictions.service.js";
import updatePredictions from "@/services/predictions/update.prediction.service.js";
import UserClass from "@/shared/data/user.class.js";
import patientsConsent from "@/services/consent/patients.consent.service.js";
import {HttpStatusCode} from "axios";

export default {
    name: "profile",
    components: {Loading},
    props: { patient: UserClass },
    data() {
        return {
            predictions: [],
            routes,
            showEditModal: false,
            editForm: {
                name: '',
                lastname: '',
                sex: null,
                email: '',
                username: '',
                password: '',
                weight: null,
                height: null,
            },
            sexes,
            anthropometricValues,

            chartData: null,
            chartOptions: null,
            processing: false
        };
    },
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
        setChartOptions() {
            const documentStyle = getComputedStyle(document.documentElement);
            const textColor = documentStyle.getPropertyValue('--p-text-color');
            const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
            const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

            return {
                maintainAspectRatio: false,
                aspectRatio: 0.6,
                plugins: {
                    legend: {
                        labels: { color: textColor, usePointStyle: true }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: textColorSecondary },
                        grid: { color: surfaceBorder }
                    },
                    y: {
                        ticks: { color: textColorSecondary },
                        grid: { color: surfaceBorder },
                        min: 0,
                        max: 100,
                    }
                }
            };
        },
        setChartData() {
            const documentStyle = getComputedStyle(document.documentElement);

            const labels = this.predictions.map(prediction =>
                `${prediction.createdAt.getDate()}/${prediction.createdAt.getMonth()+1}/${prediction.createdAt.getFullYear() - 2000}`);
            const data = this.predictions.map(prediction => Math.round(prediction.riskScore * 100));

            return {
                labels,
                datasets: [
                    { label: 'Riesgo de Recaída', data, fill: false, tension: 0.4, borderColor: "#007ad9" }
                ]
            };
        },
        getSalutation(sex) {
            switch (sex) {
                case false:
                case 0:     return 'Bienvenida, ';
                case true:
                case 1:     return 'Bienvenido, ';
                default:    return 'Hola, ';
            }
        },
        async openEditModal() {
            this.editForm = {
                name: this.patient.name,
                lastname: this.patient.lastname,
                email: this.patient.email || '',
                username: this.patient.username || '',
                password: this.patient.password || '',
                sex: !!this.patient.sex,
                weight: this.patient.weight,
                height: this.patient.height,
            };
            this.showEditModal = true;
        },
        async saveEditedData() {
            const res = await updatePatientData(this.patient, this.editForm);
            if (res.error) this.handleError(res, "Error al actualizar datos del paciente");

            this.$toast?.add(toastMessages.dataUpdated);
            this.$emit('login', res.response)
            this.showEditModal = false;
        },
        async loadPredictions() {
            try {
                const predictions = await getPredictions(this.patient.id)
                if(predictions.error) return this.handleError(predictions, "Error al cargar predicciones");
                if (predictions.response)
                    for (const prediction of predictions.response)
                        prediction.createdAt = new Date(prediction.createdAt);
                this.predictions = predictions.response;
            } catch (e) { console.error(e) }
        },
        async updatePrediction(){
            const res = await updatePredictions(this.patient.id);
            if(res.error) return this.handleError(res, "Error al actualizar predicción");
            await this.loadPredictions();
            this.chartData = this.setChartData();
        },
        notifications() { this.$emit('notifications') },
        async acceptTerms() {
            this.processing = true
            try {
                const res = await patientsConsent(this.patient.id);
                if (res.error) return this.handleError(res, "Error al aceptar términos");
                this.patient.termsAccepted = true;
                this.$emit('login', this.patient);
                this.$toast?.add(toastMessages.termsAccepted);
            } finally { this.processing = false }
        },
    },
    async beforeMount() {
        if (!this.patient) {
            this.$toast?.add(toastMessages.sessionExpired)
            return this.$emit('logout');
        }
        if(this.patient.sex !== undefined) this.editForm.sex = this.patient.sex;
        await this.loadPredictions();
        this.chartData = this.setChartData();
        this.chartOptions = this.setChartOptions();
    }
};
</script>

<template>
    <div class="margin-auto padding-height-2 flex col center gap-1-5" v-if="patient && patient.termsAccepted">
        <div class="flex col center">
            <h1 class="font-48px" v-motion-slide-top :duration="1000" :delay="800">SomApp</h1>
            <div class="font-16px margin-width-1 margin-top--0-3 text-center"
                 v-motion-slide-top :duration="1000" :delay="750">
                <div> {{ getSalutation(patient.sex) }} {{patient.name}} {{patient.lastname}} </div>
                <div v-if="predictions && predictions.length">Riesgo de Recaída: {{predictions?.length?
                    Math.round(predictions[predictions.length - 1]?.riskScore*100) + '%'
                    :'Cargando predicción de recaída...'}}
                </div>
            </div>


            <div class="font-16px margin-width-2 text-center margin-top--0-3"
                 v-if="patient.linkable" v-motion-slide-top :duration="1000" :delay="700">
                Código de Vinculación: {{ patient.id }}
            </div>
        </div>
        <Chart type="line" :data="chartData" :options="chartOptions" class="width-360 height-220"
               v-if="chartData && chartOptions"/>
        <img src="/healthcare.svg" alt="logo" class="width-120" v-else
                 v-motion-slide-top :duration="1000" :delay="500">
        <div class="flex col buttons-container gap-0-5 center">
            <Button @click="$emit('chat')" severity="primary" label="Ir al chat"
                    fluid v-if="patient" v-motion-slide-top :duration="1000" :delay="350"/>
            <Button @click="$emit('appointments')" severity="primary" label="Citas médicas"
                    fluid v-if="patient" v-motion-slide-top :duration="1000" :delay="300"/>

            <Button @click="$emit('allergies')" severity="primary" label="Alergias"
                    fluid v-if="patient" v-motion-slide-top :duration="1000" :delay="250"/>
            <Button @click="$emit('conditions')" severity="primary" label="Condiciones Médicas"
                    fluid v-if="patient" v-motion-slide-top :duration="1000" :delay="200"/>
            <Button @click="$emit('risks')" severity="primary" label="Factores de Riesgo"
                    fluid v-if="patient" v-motion-slide-top :duration="1000" :delay="150"/>
            <Button @click="$emit('symptoms')" severity="primary" label="Síntomas de Recaída"
                    fluid v-if="patient" v-motion-slide-top :duration="1000" :delay="100"/>

            <Button v-if="patient" @click="updatePrediction" severity="secondary" label="Actualizar Predicción"
                    fluid v-motion-slide-top :duration="1000" :delay="0"/>
            <Button @click="notifications" severity="secondary" label="Ver notificaciones"
                    fluid v-if="patient" v-motion-slide-top :duration="1000" :delay="100"/>
            <Button @click="openEditModal" severity="secondary" label="Editar mis Datos"
                    fluid v-motion-slide-top :duration="1000" :delay="50"/>
            <Button @click="$emit('logout')" severity="secondary" label="Cerrar sesión"
                    fluid v-motion-slide-top :duration="1000"/>



        </div>
    </div>
    <Card v-else-if="patient && !patient.termsAccepted">
        <template #content>
            <div class="flex col gap-1 center padding-2">
                <h2 class="center text-center font-22px">Términos y Condiciones</h2>
                <p>Para continuar utilizando SomApp, es necesario que aceptes nuestros
                    <a href="/terms.html" class="text-button primary-color">términos y condiciones</a>.
                </p>
                <div class="flex row gap-1">
                    <Button label="Cerrar Sesión" icon="pi pi-times" severity="secondary"
                            @click="$emit('logout')" :disabled="processing"/>
                    <Button label="Aceptar" icon="pi pi-check" @click="acceptTerms"
                            :disabled="processing" :loading="processing"/>
                </div>
            </div>
        </template>
    </Card>
    <!-- Modal para editar datos -->
    <Dialog
        v-model:visible="showEditModal"
        :modal="true"
        header="Editar datos del paciente"
        :style="{ width: '22rem' }"
        :pt="{ root: { class: 'border-radius-1' } }"
        @hide="showEditModal = false"
    >
        <form @submit.prevent="saveEditedData" class="flex col gap-1 center">
            <FloatLabel>
                <InputText id="name" v-model="editForm.name"/>
                <label for="name">Nombre</label>
            </FloatLabel>
            <FloatLabel>
                <InputText id="lastname" v-model="editForm.lastname"/>
                <label for="lastname">Apellido</label>
            </FloatLabel>
            <FloatLabel>
                <Select id="sex" v-model="editForm.sex" :options="sexes"
                        optionLabel="label" optionValue="value"/>
                <label for="sex">Sexo</label>
            </FloatLabel>
            <FloatLabel>
                <InputText id="email" v-model="editForm.email"/>
                <label for="email">Correo electrónico</label>
            </FloatLabel>
            <FloatLabel>
                <InputText id="username" v-model="editForm.username"/>
                <label for="username">Usuario</label>
            </FloatLabel>
            <FloatLabel>
                <Password id="password" v-model="editForm.password" toggleMask/>
                <label for="password">Contraseña (Opcional)</label>
            </FloatLabel>

            <FloatLabel v-for="av in anthropometricValues" :key="av.key">
                <InputNumber mode="decimal" :id="av.key" v-model.number="editForm[av.key]"
                             minFractionDigits="2" :useGrouping="false" :step="av.step"
                             :min="av.min" :max="av.max" :showButtons="true"/>
                <label :for="av.key">{{av.label}}</label>
            </FloatLabel>
            <div class="flex row gap-0-5 justify-end margin-top-1">
                <Button label="Cancelar" icon="pi pi-times" class="p-button-text"
                        @click="showEditModal = false" type="button"/>
                <Button label="Guardar" icon="pi pi-check" type="submit"/>
            </div>
        </form>
    </Dialog>
</template>

<style scoped>
label {
    color: var(--text) !important;
    text-shadow: none !important;
}
.buttons-container{
    width: calc(100vw - 2rem);
    max-width: 16rem;
}
</style>