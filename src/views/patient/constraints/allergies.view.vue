<script>
import getAllergiesPerPatient from "@/services/allergies/get.allergies.per.patient.service.js";
import linkAllergiesToPatients from "@/services/allergies/link.allergies.to.patients.service.js";
import unlinkAllergiesFromPatients from "@/services/allergies/unlink.allergies.from.patients.service.js";
import toasts from "@/services/toasts/toast.messages.service.js";
import {HttpStatusCode} from "axios";

export default {
    name: "allergies",
    props: {patient: Object, allergies: Array},
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
        async addAllergy(allergyId) {
            const existing = this.allergiesPerPatient.find(c => c.allergyId === allergyId);
            if (existing) return this.$toast.add(toasts.warn('La alergia ya está vinculada al paciente'));

            try {
                this.processing = true;
                const res = await linkAllergiesToPatients(this.patient.id, allergyId);
                if (res.error) return this.handleError(res,"Error al agregar alergia al paciente");
                this.allergiesPerPatient.push(res.response);
                this.allergiesIdPerPatient.push(allergyId);
            } catch (e) { console.error(e); this.$toast.add(toasts.errorSaving('alergia', e.message)) }
            finally { this.processing = false; }
        },
        async deleteAllergy(allergyId) {
            try {
                const res = await unlinkAllergiesFromPatients(this.patient.id, allergyId);
                if (res.error) return this.handleError(res,"Error al quitar alergia al paciente");
                const index = this.allergiesPerPatient.findIndex(c => c.allergyId === allergyId);
                const idIndex = this.allergiesIdPerPatient.findIndex(c => c === allergyId);
                this.allergiesPerPatient.splice(index, 1);
                this.allergiesIdPerPatient.splice(idIndex, 1);
            } catch (e) {
                console.error(e);
                this.$toast.add(toasts.errorDeleting('alergia', e.message));
            } finally { this.processing = false; }
        },
        async loadAllergiesPerPatient(){
            try {
                const response = await getAllergiesPerPatient(this.patient.id)
                if (response.error) this.handleError(response, "Error al cargar alergias del paciente")
                this.allergiesPerPatient = response.response
                this.allergiesIdPerPatient = response.response.map(c=>c.allergyId)
            } catch (e) {
                console.error(e)
                this.$toast.add(toasts.errorLoading('alergias', e.message))
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
            await Promise.all([ this.loadAllergiesPerPatient() ]);
        } finally { this.loading = false }
    },
    data() {
        return {
            allergiesPerPatient: [],
            allergiesIdPerPatient: [],

            loading: true,
            processing: false
        }
    }
}
</script>

<template>
    <div class="margin-auto" v-if="loading">
        <Loading msg="Cargando datos de alergias..."/>
    </div>
    <div class="flex col col-top-center margin-auto gap-1 max-height" v-else>
        <div class="flex col center gap-1 margin-height-1" style="max-width: 26rem">
            <h1 class="font-30px white">Alergias</h1>
            <div class="font-12px text-center margin-width-1">
                SomApp debe tener conocimiento de las alergias del paciente para evitar recomendar
                alimentos, hábitos, o rutinas que puedan poner en riesgo su salud. Por ello, se le
                solicita ser muy especifico con las alergias conocidas del paciente.
            </div>
        </div>

        <div class="font-16px">Lista de Alergias:</div>
        <div class="allergiesPerPatient__container gap-0-5 padding-width-1"
             v-if="allergiesPerPatient.length">
            <Card v-for="allergy in allergies.filter(a=>allergiesIdPerPatient.some(id=>id===a.id))"
                  class="margin-bottom-0-5">
                <template #content>
                    <div class="flex row gap-1 row-justify-center">
                        <div class="font-14px constraint">{{ allergy.name }}</div>
                        <div class="flex row gap-0-5">
                            <i class="pi pi-minus" @click="!processing?deleteAllergy(allergy.id):0"
                               :class="processing?'disabled':'enabled'"/>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
        <div v-else class="font-14px">
            El usuario no tiene ninguna alergia
        </div>

        <div class="font-16px">Alergias no vinculadas al usuario:</div>
        <div class="allergiesPerPatient__container gap-0-5 padding-width-1"
             v-if="allergiesPerPatient.length < allergies.length">
            <Card v-for="allergy in allergies.filter(a=>!allergiesIdPerPatient.some(id=>id===a.id))"
                  class="margin-bottom-0-5">
                <template #content>
                    <div class="flex row gap-1 row-justify-center">
                        <div class="font-14px constraint">{{ allergy.name }}</div>
                        <div class="flex row gap-0-5">
                            <i class="pi pi-plus" @click="!processing?addAllergy(allergy.id):0"
                               :class="processing?'disabled':'enabled'"/>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
        <div v-else class="font-14px">
            No queda ninguna alergia para agregar el Usuario
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

.allergiesPerPatient__container {
    column-count: 1;
    column-gap: 0.5rem;
    row-gap: 0.5rem;
    width: 100%;
    max-width: 1200px;
}
@media (min-width: 550px) { .allergiesPerPatient__container { column-count: 2 } }
@media (min-width: 900px) { .allergiesPerPatient__container { column-count: 3 } }

</style>