<script>
import getRisksPerPatient from "@/services/risk.factors/get.risk.factors.per.patient.service.js";
import linkRiskFactorsToPatients from "@/services/risk.factors/link.risk.factors.to.patients.service.js";
import unlinkRiskFactorsFromPatients from "@/services/risk.factors/unlink.risk.factors.from.patients.service.js";
import toasts from "@/services/toasts/toast.messages.service.js";
import {HttpStatusCode} from "axios";

export default {
    name: "risks",
    props: {patient: Object, risks: Array},
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
        async addRisk(riskId) {
            const existing = this.risksPerPatient.find(c => c.riskFactorId === riskId);
            if (existing) return this.$toast.add(toasts.warn('El riesgo médica ya está vinculada al paciente'));
            try {
                this.processing = true;
                const res = await linkRiskFactorsToPatients(this.patient.id, riskId);
                if (res.error) return this.handleError(res, "Error al agregar riesgo al paciente");
                this.risksPerPatient.push(res.response);
                this.risksIdPerPatient.push(riskId);
            } catch (e) { console.error(e); this.$toast.add(toasts.errorSaving('riesgo', e.message)) }
            finally { this.processing = false; }
        },
        async deleteRisk(riskId) {
            try {
                const res = await unlinkRiskFactorsFromPatients(this.patient.id, riskId);
                if (res.error) return this.handleError(res, "Error al quitar riesgo al paciente");
                const index = this.risksPerPatient.findIndex(c => c.riskFactorId === riskId);
                const idIndex = this.risksIdPerPatient.findIndex(c => c === riskId);
                this.risksPerPatient.splice(index, 1);
                this.risksIdPerPatient.splice(idIndex, 1);
            } catch (e) { console.error(e); this.$toast.add(toasts.errorDeleting('riesgo', e.message)) }
            finally { this.processing = false; }
        },

        async loadRisksPerPatient(){
            try {
                const res = await getRisksPerPatient(this.patient.id)
                if (res.error) return this.handleError(res, "Error al cargar los riesgos del paciente");
                this.risksPerPatient = res.response
                this.risksIdPerPatient = res.response.map(c=>c.riskFactorId)
            } catch (e) { console.error(e); this.$toast.add(toasts.errorLoading('riesgos', e.message)) }
        }
    },
    async created() {
        console.log(this.risks)
        if (!this.patient) {
            this.$toast.add(toasts.noPatientSelected);
            return this.$emit('profile')
        }
        try {
            this.loading = true;
            await Promise.all([ this.loadRisksPerPatient() ]);
        } finally { this.loading = false; }
    },
    data() {
        return {
            risksPerPatient: [],
            risksIdPerPatient: [],

            loading: true,
            processing: false
        }
    }
}
</script>

<template>
    <div class="margin-auto" v-if="loading">
        <Loading msg="Cargando datos de riesgos..."/>
    </div>
    <div class="flex col col-top-center margin-auto gap-1 max-height" v-else>
        <div class="flex col center gap-1 margin-height-1" style="max-width: 26rem">
            <h1 class="font-30px white">Riesgos</h1>
            <div class="font-12px text-center margin-width-1">
                SomApp debe tener conocimiento de los factores de riesgo del paciente para generar
                predicciones de recaída más precisas. Por favor, asegúrese de agregar cualquier
                condición médica relevante que pueda influir en la salud del paciente.
            </div>
        </div>

        <div class="font-16px">Lista de Riesgos:</div>
        <div class="risksPerPatient__container gap-0-5 padding-width-1"
             v-if="Array.isArray(risksPerPatient) && risksPerPatient.length">
            <Card v-for="risk in risks.filter(a=>risksIdPerPatient.some(id=>id===a.id))"
                  class="margin-bottom-0-5" v-tooltip="{autohide: false, value: risk.description}">
                <template #content>
                    <div class="flex row gap-1 row-justify-center">
                        <div class="font-14px constraint">{{ risk.name }}</div>
                        <div class="flex row gap-0-5">
                            <i class="pi pi-minus" @click="!processing?deleteRisk(risk.id):0"
                               :class="processing?'disabled':'enabled'"/>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
        <div v-else class="font-14px">
            El usuario no tiene ninguna condición médica
        </div>

        <div class="font-16px">Riesgos no vinculadas al usuario:</div>
        <div class="risksPerPatient__container gap-0-5 padding-width-1"
             v-if="risksPerPatient.length < risks.length">
            <Card v-for="risk in risks.filter(a=>!risksIdPerPatient.some(id=>id===a.id))"
                  class="margin-bottom-0-5" v-tooltip="{autohide: false, value: risk.description}">
                <template #content>
                    <div class="flex row gap-1 row-justify-center">
                        <div class="font-14px constraint">{{ risk.name }}</div>
                        <div class="flex row gap-0-5">
                            <i class="pi pi-plus" @click="!processing?addRisk(risk.id):0"
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

.risksPerPatient__container {
    column-count: 1;
    column-gap: 0.5rem;
    row-gap: 0.5rem;
    width: 100%;
    max-width: 1200px;
}
@media (min-width: 550px) { .risksPerPatient__container { column-count: 2 } }
@media (min-width: 900px) { .risksPerPatient__container { column-count: 3 } }

</style>