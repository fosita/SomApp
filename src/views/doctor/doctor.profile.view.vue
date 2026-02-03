<script>
import updateUserData from "@/services/authentication/update.user.service.js";
import getPredictions from "@/services/predictions/get.predictions.service.js";
import Loading from "@/components/loading.component.vue";
import sexes from "@/services/patients/sexes.values.js";
import routes from "@/router/abstract.routes.js";
import toastMessages from "@/services/toasts/toast.messages.service.js";
import updatePredictions from "@/services/predictions/update.prediction.service.js";
import {HttpStatusCode} from "axios";
import {handleError} from "vue";

export default {
    name: "profile",
    components: {Loading},
    props: { doctor: Object, patient: Object },
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
            },
            sexes,

            chartData: null,
            chartOptions: null,
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
        async loadPredictions() {
            try {
                const predictions = await getPredictions(this.patient.id)
                if(predictions.error) return handleError(predictions, "Error al cargar predicciones");
                if (predictions.response) for (const prediction of predictions.response)
                    prediction.createdAt = new Date(prediction.createdAt);
                this.predictions = predictions.response;
            } catch (e) { console.error(e) }
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
                        labels: {
                            color: textColor
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: textColorSecondary },
                        grid: {
                            color: surfaceBorder
                        }
                    },
                    y: {
                        ticks: {
                            color: textColorSecondary
                        },
                        grid: {
                            color: surfaceBorder
                        },
                        min: 0,
                        max: 100
                    }
                }
            };
        },
        setChartData() {
            const documentStyle = getComputedStyle(document.documentElement);
            const labels = this.predictions.map(prediction =>
                `${prediction.createdAt.getDate()}/${prediction.createdAt.getMonth()+1}`);
            const data = this.predictions.map(prediction => Math.round(prediction.riskScore * 100));
            return {
                labels,
                datasets: [{
                    label: this.patient?this.patient.name + ' ' + this.patient.lastname:'Riesgo de Recaída %',
                    data,
                    fill: false,
                    borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
                    tension: 0.4
                }]
            };
        },
        getSalutation(sex) {
            if(sex === undefined || sex === null) return 'Hola, ';
            if(sex) return 'Bienvenido, ';
            else return 'Bienvenida, ';
        },
        async openEditModal() {
            this.editForm = {
                name: this.doctor.name || '',
                lastname: this.doctor.lastname || '',
                email: this.doctor.email || '',
                username: this.doctor.username || '',
                password: this.doctor.password || '',
                sex: !!this.doctor.sex,
            };
            this.showEditModal = true;
        },
        async saveEditedData() {
            const res = await updateUserData(this.doctor, this.editForm);
            if (res.error) return this.handleError(res, "Error al actualizar datos");
            this.$toast?.add(toastMessages.dataUpdated);
            this.$emit('login', res.response)
            this.showEditModal = false;
        },
        async updatePrediction() {
            const res = await updatePredictions(this.patient.id);
            if(res.error) return this.handleError(res, "Error al actualizar predicción");
            await this.loadPredictions();
            this.chartData = this.setChartData();
            this.chartOptions = this.setChartOptions();
        }
    },
    async created() {
        if (!this.doctor) {
            this.$toast?.add(toastMessages.sessionExpired)
            return this.$emit('logout');
        }
        if(this.patient) await this.loadPredictions();
        this.chartData = this.setChartData();
        this.chartOptions = this.setChartOptions();
    }
};
</script>

<template>
    <div class="margin-auto padding-height-2 flex col center" v-if="doctor">
        <div class="flex col center">
            <h1 class="font-48px" v-motion-slide-top :duration="1000" :delay="800">SomApp</h1>
            <div class="font-20px margin-width-1 margin-top--0-3 text-center"
                 v-motion-slide-top :duration="1000" :delay="750">
                {{ getSalutation(doctor.sex) }} {{doctor.name}} {{doctor.lastname}}
            </div>
            <div class="font-16px margin-width-1 margin-top--0-3 text-center"
                 v-if="patient" v-motion-slide-top :duration="1000" :delay="700">
                <div>Paciente: {{patient.name}} {{patient.lastname}}</div>
                <div>Riesgo de Recaída: {{predictions?.length?
                    Math.round(predictions[predictions.length - 1]?.riskScore*100) + '%'
                    :'Cargando predicción de recaída...'}}
                </div>
            </div>
            <div class="font-16px margin-width-1 margin-top--0-3 text-center"
                 v-else v-motion-slide-top :duration="1000" :delay="700">
                No ha seleccionado ningún paciente
            </div>

        </div>
        <Chart type="line" :data="chartData" :options="chartOptions" class="width-400 height-220"
               v-if="chartData && chartOptions && patient"/>
        <img src="/healthcare.svg" alt="logo" class="width-120" v-else
             v-motion-slide-top :duration="1000" :delay="500">
        <div class="flex col buttons-container gap-0-5 center">
            <Button @click="$emit('patientSelector')" label="Gestionar Pacientes"
                    fluid v-motion-slide-top :duration="1000" :delay="400"/>
            <Button @click="$emit('doctorRooms')" label="Gestionar Consultorios"
                    fluid v-motion-slide-top :duration="1000" :delay="350"/>


            <Button @click="$emit('chat')" severity="primary" label="Ir al chat"
                    fluid v-if="patient" v-motion-slide-top :duration="1000" :delay="300"/>
            <Button @click="$emit('appointments')" severity="primary" label="Citas médicas"
                    fluid v-if="patient" v-motion-slide-top :duration="1000" :delay="250"/>
            <Button @click="$emit('notifications')" severity="primary" label="Enviar notificación"
                    fluid v-if="patient" v-motion-slide-top :duration="1000" :delay="200"/>

            <Button @click="$emit('symptoms')" severity="primary" label="Síntomas de Recaída"
                    fluid v-if="patient" v-motion-slide-top :duration="1000" :delay="100"/>
            <Button @click="$emit('allergies')" severity="secondary" label="Alergias"
                    fluid v-if="patient" v-motion-slide-top :duration="1000" :delay="150"/>
            <Button @click="$emit('conditions')" severity="secondary" label="Condiciones Médicas"
                    fluid v-if="patient" v-motion-slide-top :duration="1000" :delay="100"/>
            <Button @click="$emit('risks')" severity="secondary" label="Factores de Riesgo"
                    fluid v-if="patient" v-motion-slide-top :duration="1000" :delay="100"/>

            <Button v-if="patient" @click="updatePrediction" severity="secondary" label="Actualizar Predicción"
                    fluid v-motion-slide-top :duration="1000" :delay="100"/>
            <Button @click="openEditModal" severity="secondary" label="Editar mis Datos"
                    fluid v-motion-slide-top :duration="1000" :delay="50"/>
            <Button @click="$emit('logout')" severity="secondary" label="Cerrar sesión"
                    fluid v-motion-slide-top :duration="1000"/>
        </div>
    </div>

    <!-- Modal para editar datos -->
    <Dialog
        v-model:visible="showEditModal"
        :modal="true"
        header="Editar datos del Doctor"
        :style="{ width: '22rem' }"
        :pt="{ root: { class: 'border-radius-1' } }"
        @hide="showEditModal = false">
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
                <InputText id="user" v-model="editForm.username"/>
                <label for="user">Usuario</label>
            </FloatLabel>
            <FloatLabel>
                <InputText id="pass" v-model="editForm.password"/>
                <label for="pass">Contraseña (Opcional)</label>
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
label { color: var(--text) !important; text-shadow: none !important }
.buttons-container{ width: calc(100vw - 2rem); max-width: 16rem }
</style>