<script>
import getConditionsPerPatient from "@/services/conditions/get.conditions.per.patient.service.js";
import linkConditionsToPatients from "@/services/conditions/link.conditions.to.patients.service.js";
import unlinkConditionsFromPatients from "@/services/conditions/unlink.conditions.from.patients.service.js";
import toasts from "@/services/toasts/toast.messages.service.js";
import {HttpStatusCode} from "axios";
export default {
    name: "conditions",
    props: {patient: Object, conditions: Array},
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
        async addCondition(conditionId) {
            const existing = this.conditionsPerPatient.find(c => c.conditionId === conditionId);
            if (existing) return this.$toast.add(toasts.warn('El paciente ya tiene dicha condición médica'));

            try {
                this.processing = true;
                const res = await linkConditionsToPatients(this.patient.id, conditionId);
                if (res.error) return this.handleError(res, "Error al agregar condición médica al paciente");
                this.conditionsPerPatient.push(res.response);
                this.conditionsIdPerPatient.push(conditionId);
            } catch (e) {
                console.error(e);
                this.$toast.add(toasts.errorSaving('condicion médica', e.message));
            } finally { this.processing = false; }
        },
        async deleteCondition(conditionId) {
            try {
                const res = await unlinkConditionsFromPatients(this.patient.id, conditionId);
                if (res.error) return this.handleError(res, "Error al quitar condición médica al paciente");
                const index = this.conditionsPerPatient.findIndex(c => c.conditionId === conditionId);
                const idIndex = this.conditionsIdPerPatient.findIndex(c => c === conditionId);
                this.conditionsPerPatient.splice(index, 1);
                this.conditionsIdPerPatient.splice(idIndex, 1);
            } catch (e) {
                console.error(e);
                this.$toast.add(toasts.errorDeleting('condicion médica', e.message));
            } finally { this.processing = false; }
        },
        async loadConditionsPerPatient(){
            try {
                const response = await getConditionsPerPatient(this.patient.id)
                if (response.error)
                    return this.$toast.add(toasts.errorLoading('condiciones médicas', response.error));

                this.conditionsPerPatient = response.response
                this.conditionsIdPerPatient = response.response.map(c=>c.conditionId)
            } catch (e) {
                console.error(e)
                this.$toast.add(toasts.errorLoading('condiciones médicas', e.message))
            }
        },
    },
    async created() {
        if (!this.patient) {
            this.$toast.add(toasts.noPatientSelected);
            return this.$emit('profile')
        }
        try {
            this.loading = true;
            await Promise.all([ this.loadConditionsPerPatient() ]);
        } finally { this.loading = false }
    },
    data() {
        return {
            conditionsPerPatient: [],
            conditionsIdPerPatient: [],

            loading: true,
            processing: false
        }
    }
}
</script>

<template>
    <div class="margin-auto" v-if="loading">
        <Loading msg="Cargando datos de condiciones médicas..."/>
    </div>
    <div class="flex col col-top-center margin-auto gap-1 max-height" v-else>
        <div class="flex col center gap-1 margin-height-1" style="max-width: 26rem">
            <h1 class="font-30px white">Condiciones Médicas</h1>
            <div class="font-12px text-center margin-width-1">
                SomApp debe tener conocimiento de las condiciones médicas del paciente para evitar recomendar
                alimentos, hábitos, o rutinas que puedan poner en riesgo su salud. Por ello, se le
                solicita ser muy especifico con las condiciones médicas conocidas del paciente.
            </div>
        </div>

        <div class="font-16px">Lista de Condiciones Médicas:</div>
        <div class="conditionsPerPatient__container gap-0-5 padding-width-1"
             v-if="conditionsPerPatient.length">
            <Card v-for="condition in conditions.filter(a=>conditionsIdPerPatient.some(id=>id===a.id))"
                  class="margin-bottom-0-5" v-tooltip="{autohide: false, value: condition.description}">
                <template #content>
                    <div class="flex row gap-1 row-justify-center">
                        <div class="font-14px constraint">{{ condition.name }}</div>
                        <div class="flex row gap-0-5">
                            <i class="pi pi-minus" @click="!processing?deleteCondition(condition.id):0"
                               :class="processing?'disabled':'enabled'"/>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
        <div v-else class="font-14px">
            El usuario no tiene ninguna condición médica
        </div>

        <div class="font-16px">Condiciones Médicas no vinculadas al usuario:</div>
        <div class="conditionsPerPatient__container gap-0-5 padding-width-1"
             v-if="conditionsPerPatient.length < conditions.length">
            <Card v-for="condition in conditions.filter(a=>!conditionsIdPerPatient.some(id=>id===a.id))"
                  class="margin-bottom-0-5" v-tooltip="{autohide: false, value: condition.description}">
                <template #content>
                    <div class="flex row gap-1 row-justify-center">
                        <div class="font-14px constraint">{{ condition.name }}</div>
                        <div class="flex row gap-0-5">
                            <i class="pi pi-plus" @click="!processing?addCondition(condition.id):0"
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

.conditionsPerPatient__container {
    column-count: 1;
    column-gap: 0.5rem;
    row-gap: 0.5rem;
    width: 100%;
    max-width: 1200px;
}
@media (min-width: 550px) { .conditionsPerPatient__container { column-count: 2 } }
@media (min-width: 900px) { .conditionsPerPatient__container { column-count: 3 } }

</style>