<script>
import getSymptomsPerPatient from "@/services/symptoms/get.symptoms.per.patient.service.js";
import linkSymptomsToPatients from "@/services/symptoms/link.symptoms.to.patients.service.js";
import unlinkSymptomsFromPatients from "@/services/symptoms/unlink.symptoms.from.patients.service.js";
import toasts from "@/services/toasts/toast.messages.service.js";
import {HttpStatusCode} from "axios";

export default {
    name: "symptoms",
    props: {patient: Object, symptoms: Array},
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
        async addSymptom(symptomId) {
            const existing = this.symptomsPerPatient.find(c => c.symptomId === symptomId);
            if (existing) return this.$toast.add(toasts.warn('El riesgo médica ya está vinculada al paciente'));
            try {
                this.processing = true;
                const res = await linkSymptomsToPatients(this.patient.id, symptomId);
                if (res.error) return this.handleError(res, "Error al agregar síntoma al paciente");
                this.symptomsPerPatient.push(res.response);
                this.symptomsIdPerPatient.push(symptomId);
            } catch (e) { console.error(e); this.$toast.add(toasts.errorSaving('riesgo', e.message)) }
            finally { this.processing = false; }
        },
        async deleteSymptom(symptomId) {
            try {
                const response = await unlinkSymptomsFromPatients(this.patient.id, symptomId);
                if (response.error) return this.$toast.add(toasts.errorDeleting('riesgo', response.error));
                const index = this.symptomsPerPatient.findIndex(c => c.symptomId === symptomId);
                const idIndex = this.symptomsIdPerPatient.findIndex(c => c === symptomId);
                this.symptomsPerPatient.splice(index, 1);
                this.symptomsIdPerPatient.splice(idIndex, 1);
            } catch (e) { console.error(e); this.$toast.add(toasts.errorDeleting('riesgo', e.message)) }
            finally { this.processing = false; }
        },

        async loadSymptomsPerPatient(){
            try {
                const response = await getSymptomsPerPatient(this.patient.id)
                if (response.error) return this.$toast.add(toasts.errorLoading('síntomas', response.error));
                this.symptomsPerPatient = response.response
                this.symptomsIdPerPatient = response.response.map(c=>c.symptomId)
            } catch (e) { console.error(e); this.$toast.add(toasts.errorLoading('síntomas', e.message)) }
        }
    },
    async created() {
        if (!this.patient) {
            this.$toast.add(toasts.noPatientSelected);
            return this.$emit('profile')
        }
        try {
            this.loading = true;
            await Promise.all([ this.loadSymptomsPerPatient() ]);
        } finally { this.loading = false; }
    },
    data() {
        return {
            symptomsPerPatient: [],
            symptomsIdPerPatient: [],

            loading: true,
            processing: false
        }
    }
}
</script>

<template>
    <div class="margin-auto" v-if="loading">
        <Loading msg="Cargando datos de síntomas..."/>
    </div>
    <div class="flex col col-top-center margin-auto gap-1 max-height" v-else>
        <div class="flex col center gap-1 margin-height-1" style="max-width: 26rem">
            <h1 class="font-30px white">Síntomas</h1>
            <div class="font-12px text-center margin-width-1">
                SomApp debe tener conocimiento de los síntomas del paciente para generar
                predicciones de recaída más precisas, y generar mensajes más exactos. Por 
                favor, asegúrese de agregar cualquier síntoma que halla experimentado.
            </div>
        </div>

        <div class="font-16px">Lista de Síntomas:</div>
        <div class="symptomsPerPatient__container gap-0-5 padding-width-1"
             v-if="Array.isArray(symptomsPerPatient) && symptomsPerPatient.length">
            <Card v-for="symptom in symptoms.filter(a=>symptomsIdPerPatient.some(id=>id===a.id))"
                  class="margin-bottom-0-5" v-tooltip="{autohide: false, value: symptom.description}">
                <template #content>
                    <div class="flex row gap-1 row-justify-center">
                        <div class="font-14px constraint">{{ symptom.name }}</div>
                        <div class="flex row gap-0-5">
                            <i class="pi pi-minus" @click="!processing?deleteSymptom(symptom.id):0"
                               :class="processing?'disabled':'enabled'"/>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
        <div v-else class="font-14px">
            El usuario no tiene ninguna condición médica
        </div>

        <div class="font-16px">Síntomas no vinculadas al usuario:</div>
        <div class="symptomsPerPatient__container gap-0-5 padding-width-1"
             v-if="symptomsPerPatient.length < symptoms.length">
            <Card v-for="symptom in symptoms.filter(a=>!symptomsIdPerPatient.some(id=>id===a.id))"
                  class="margin-bottom-0-5" v-tooltip="{autohide: false, value: symptom.description}">
                <template #content>
                    <div class="flex row gap-1 row-justify-center">
                        <div class="font-14px constraint">{{ symptom.name }}</div>
                        <div class="flex row gap-0-5">
                            <i class="pi pi-plus" @click="!processing?addSymptom(symptom.id):0"
                               :class="processing?'disabled':'enabled'"/>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
        <div v-else class="font-14px">
            No queda ninguna condición médica para agregar el Usuario
        </div>

        <div class="flex col buttons-container gap-0-5 center margin-bottom-1">
            <Button @click="$emit('profile')" severity="secondary" fluid>Volver</Button>
        </div>
    </div>
    <div class="absolute top-0-5 left-0-5">
        <Button icon="pi pi-chevron-left" @click="$emit('profile')" severity="secondary" rounded/>
    </div>
</template>

<style>
/*Define an animation*/
.text-shadow { text-shadow: 4px 4px 4px rgba(0, 0, 0, 0.25) }
.box-shadow { box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.25) }

.enabled { color: #111; cursor: pointer; }
.disabled { color: #1118; cursor: not-allowed; }
@media (prefers-color-scheme: dark) {
    .enabled { color: #fff; }
    .disabled { color: #fff8; }
}

.constraint {
    width: 100%;
    padding: 0.01rem;
    display: inline-block;
}

.p-inputgroup { width: calc(100% - 2rem) !important }
.p-inputgroup .p-inputtext {
    width: 100% !important;
    min-width: 60% !important;
    max-width: 100% !important;
}
.buttons-container{
    width: calc(100vw - 2rem);
    max-width: 16rem;
}

.symptomsPerPatient__container {
    column-count: 1;
    column-gap: 0.5rem;
    row-gap: 0.5rem;
    width: 100%;
    max-width: 1200px;
}
@media (min-width: 550px) { .symptomsPerPatient__container { column-count: 2 } }
@media (min-width: 900px) { .symptomsPerPatient__container { column-count: 3 } }

</style>