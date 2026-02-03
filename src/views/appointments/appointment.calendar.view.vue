<script>
import getAppointments from "@/services/appointments/get.appointments.service.js";
import updateAppointment from "@/services/appointments/update.appointment.service.js";
import getDoctorsPerPatient from "@/services/patients/get.doctors.per.patient.js";
import createAppointment from "@/services/appointments/create.appointment.service.js";
import deleteAppointment from "@/services/appointments/delete.appointment.service.js";
import {getAvailableStatuses} from "@/shared/data/statuses.js";
import {FloatLabel} from "primevue";
import uRoles from "@/shared/data/user.roles.js";
import toasts from "@/services/toasts/toast.messages.service.js";
import {HttpStatusCode} from "axios";
import {handleError} from "vue";
export default {
    name: "appointments",
    components: {FloatLabel},
    props: {doctor: Object, patient: Object, appointmentStatuses: Array, appointmentMethods: Array},
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
        async getDoctors() {
            const doctors = await getDoctorsPerPatient(this.patient.id);
            if (doctors.error) return this.handleError(doctors, "Error al cargar doctores")
            this.doctors = doctors.response;
        },
        async getAppointments() {
            const appointments = await getAppointments(this.patient.id, this.doctor?.id);
            if (appointments.error) return handleError(appointments, "Error al cargar citas")
            this.appointments = appointments.response;
        },
        async createAppointment() {
            if (!this.appointment.topic) return this.$toast.add({
                severity: 'warn',
                summary: 'Título faltante',
                detail: 'Por favor, ingrese un título para la cita.',
                life: 5000,
            });
            if (!this.appointment.reason) return this.$toast.add({
                severity: 'warn',
                summary: 'Contenido faltante',
                detail: 'Por favor, ingrese el contenido de la cita.',
                life: 5000,
            });
            if (!this.appointment.start) return this.$toast.add({
                severity: 'warn',
                summary: 'Fecha de inicio faltante',
                detail: 'Por favor, seleccione una fecha y hora de inicio para la cita.',
                life: 5000,
            });
            if (!this.appointment.end) return this.$toast.add({
                severity: 'warn',
                summary: 'Fecha de finalización faltante',
                detail: 'Por favor, seleccione una fecha y hora de finalización para la cita.',
                life: 5000,
            });
            if (!this.appointment.methodId) return this.$toast.add({
                severity: 'warn',
                summary: 'Método faltante',
                detail: 'Por favor, seleccione un método para la cita.',
                life: 5000,
            });
            if (!this.appointment.statusId) return this.$toast.add({
                severity: 'warn',
                summary: 'Estado faltante',
                detail: 'Por favor, seleccione un estado para la cita.',
                life: 5000,
            });

            const response = await createAppointment(this.patient.id, this.appointment.doctorId, this.appointment)
            if (response.error) return this.handleError(response, "Error al crear cita")
            this.$toast.add({
                severity: 'success',
                summary: 'Cita creada',
                detail: 'La cita se ha creado correctamente.',
                life: 5000,
            });
            this.showCreator = false;
            await this.getAppointments();
        },
        async reloadAppointments() {
            try {
                this.loading = true;
                await this.getAppointments();
            } catch (error) { console.error(error) }
            finally { this.loading = false }
        },
        async deleteAppointment(appointment) {
            this.loading = true
            const res = await deleteAppointment(this.patient.id, this.doctor?.id, appointment.id);
            if (res.error) return this.handleError(res, "Error al eliminar la cita")

            this.$toast.add({
                severity: 'success',
                summary: 'Cita eliminada',
                detail: 'La cita se ha eliminado correctamente.',
                life: 5000,
            });
            await this.getAppointments();
            this.loading = false
        },
        async updateAppointment() {
            this.loading = true
            const res = await updateAppointment(this.patient.id, this.doctor?.id, this.appointment);
            if (res.error) return this.handleError(res, "Error al actualizar la cita")
            this.$toast.add({
                severity: 'success',
                summary: 'Cita actualizada',
                detail: 'La cita se ha actualizado correctamente.',
                life: 5000,
            });
            await this.getAppointments();
            this.showCreator = false;
            this.loading = false
        },
        askToDelete(appointment) {
            this.$confirm.require({
                group: 'html',
                message: `<p class="text-center font-13px">¿Está seguro de que desea eliminar esta cita?</p>
                          <p class="text-center font-17px">Esta acción no se puede deshacer</p>`,
                header: `Eliminar ${appointment.topic}`,
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Sí, eliminar',
                acceptClass: 'p-button-danger max-width',
                acceptIcon: 'pi pi-trash',
                rejectLabel: 'No, cancelar',
                rejectClass: 'p-button-secondary max-width',
                rejectIcon: 'pi pi-chevron-left',

                accept: () => this.deleteAppointment(appointment),
                reject: () => toasts.info('Operación cancelada', 'La cita no ha sido eliminada.')
            });
        },

        doctorName(doctorId) {
            const doctor = this.doctors.find(doc => doc.id === doctorId);
            return doctor ? `${doctor.name} ${doctor.lastname}` : "Desconocido";
        },
        getStatus(statusId) {
            const status = this.appointmentStatuses.find(st => st.id === statusId);
            return status ? status.name : "Desconocido";
        },
        getStatusColor(statusId) {
            const status = this.appointmentStatuses.find(st => st.id === statusId);
            return status ? status.color : "gray";
        },
        getMethod(methodId) {
            const method = this.appointmentMethods.find(mt => mt.id === methodId);
            return method ? method.name : "Desconocido";
        },
        getMethodColor(methodId) {
            const method = this.appointmentMethods.find(mt => mt.id === methodId);
            return method ? method.color : "gray";
        },
        createNewAppointment() {
            const role = this.doctor ? uRoles.doctor : uRoles.patient
            this.selectableStatuses = getAvailableStatuses(role, null, this.appointmentStatuses);
            this.appointment = {
                doctorId: this.doctor ? this.doctor.id : null,
                methodId: null,
                statusId: null,
                roomId: null,
                proposedBy: role,
                topic: "",
                reason: "",
                start: null,
                end: null,
            }
            this.showCreator = true;
        },
        editAppointment(appointment) {
            this.selectableStatuses = getAvailableStatuses(
            this.doctor ? uRoles.doctor : uRoles.patient, appointment.statusId, this.appointmentStatuses);
            this.appointment = appointment;
            this.appointment.start = new Date(appointment.start);
            this.appointment.end = new Date(appointment.end);

            this.showCreator = true;
        }
    },
    data() {
        return {
            uRoles,
            loading: true,

            doctors: null,
            appointments: null,
            selectableStatuses: [],

            minEnd: null,
            maxEnd: null,

            showCreator: false,
            appointment: {}
        };
    },
    async created() {
        try {
            this.loading = true;
            await this.getDoctors();
            await this.getAppointments();
        } catch (error) { console.error(error) }
        finally { this.loading = false; }
    },
    watch: {
        appointment: {
            handler(newAppointment) {
                if (newAppointment.start) {
                    const startDate = new Date(newAppointment.start);
                    this.minEnd = new Date(startDate.getTime() + 15 * 60000); // +15 minutes
                    this.maxEnd = new Date(startDate.getTime() + 8 * 60 * 60000); // +8 hours
                    if (newAppointment.end) {
                        const endDate = new Date(newAppointment.end);
                        if (endDate < this.minEnd)
                            return this.appointment.end = this.minEnd;
                        if (endDate > this.maxEnd)
                            return this.appointment.end = this.maxEnd;
                    }
                } else {
                    this.minEnd = null;
                    this.maxEnd = null;
                    this.appointment.end = null;
                }
            },
            deep: true
        }
    }
}
</script>

<template>
    <div class="flex col center gap-1 padding-1">
        <h2 class="font-24px lh-32px">Citas Médicas</h2>
        <div v-if="loading" class="flex col center gap-1">
            <i class="pi pi-spinner pi-spin" style="font-size: 2rem"/>
            <div>Cargando citas médicas...</div>
        </div>
        <div v-else-if="appointments && appointments.length === 0" class="flex col center gap-1">
            <i class="pi pi-calendar-clock" style="font-size: 3rem"/>
            <div>No hay citas creadas</div>
        </div>
        <div v-else class="flex row flex-wrap max-width center gap-1">
            <Card v-for="appointment in appointments" :key="appointment.id" style="width: 350px;">
                <template #content>
                    <div class="font-20px lh-22px"> {{ appointment.topic }}</div>
                    <div class="font-16px lh-18px"> {{ appointment.reason }}</div>
                    <div class="font-12px" v-if="!doctor">Doctor: {{ doctorName(appointment.doctorId) }}</div>
                    <div class="font-12px flex row-center-left gap-0-3">Estado:
                        <i class="pi pi-circle-fill" :style="{color: getStatusColor(appointment.statusId)}"/>
                        {{ getStatus(appointment.statusId) }}
                    </div>
                    <div class="font-12px flex row-center-left gap-0-3">Método:
                        <i class="pi pi-circle-fill" :style="{color: getMethodColor(appointment.methodId)}"/>
                        {{ getMethod(appointment.methodId) }}
                    </div>
                    <div class="font-12px lh-16px text-secondary">
                        Fecha: {{ new Date(appointment.start).toLocaleString('es-PE', {dateStyle: 'short'}) }}
                    </div>
                    <div class="font-12px">
                        Hora: {{ new Date(appointment.start).toLocaleString('es-PE', {timeStyle: 'short'}) }} -
                        {{ new Date(appointment.end).toLocaleString('es-PE', {timeStyle: 'short'}) }}
                    </div>

                    <div class="flex row max-width gap-0-5 margin-top-0-5">
                        <Button fluid label="Editar" icon="pi pi-pencil" severity="primary"
                                @click="editAppointment(appointment)" size="small"/>
                        <Button fluid label="Eliminar" icon="pi pi-trash" severity="danger"
                                @click="askToDelete(appointment)" size="small"/>
                    </div>
                </template>
            </Card>
        </div>
        <div class="flex row center gap-1">
            <Button label="Actualizar" icon="pi pi-refresh" @click="reloadAppointments"/>
            <Button label="Agregar" icon="pi pi-plus" @click="createNewAppointment"/>
        </div>
    </div>

    <Dialog :header="appointment.id?'Actualizar Cita':'Crear Cita'" v-model:visible="showCreator"
            :modal="true" :closable="true" :style="{width: '400px'}">
        <div class="flex col gap-1 max-width">
            <FloatLabel>
                <InputText v-model="appointment.topic" id="topic" class="full-max-width"/>
                <label for="topic">Asunto</label>
            </FloatLabel>
            <FloatLabel>
                <Textarea v-model="appointment.reason" id="reason" rows="5" class="full-max-width"/>
                <label for="reason">Justificación</label>
            </FloatLabel>

            <FloatLabel>
                <Calendar id="start" v-model="appointment.start" showTime hourFormat="12"
                          class="full-max-width" inputClass="full-max-width" fluid/>
                <label for="start">Inicio</label>
            </FloatLabel>

            <FloatLabel>
                <Calendar id="end" v-model="appointment.end" showTime hourFormat="12"
                          class="full-max-width" inputClass="full-max-width" fluid
                          :disabled="!minEnd || !maxEnd" :minDate="minEnd" :maxDate="maxEnd"/>
                <label for="end">Finalización</label>
            </FloatLabel>

            <FloatLabel>
                <InputText id="proposedBy" class="full-max-width" disabled v-model="appointment.proposedBy"
                           :value="appointment.proposedBy === uRoles.doctor ? 'Doctor' : 'Paciente'"/>
                <label for="proposedBy">Propuesto por</label>
            </FloatLabel>

            <FloatLabel>
                <Select v-model="appointment.doctorId" :options="doctors"
                        :optionLabel="(o)=>o.name + ' ' + o.lastname" option-value="id"
                        class="full-max-width" :disabled="doctor || appointment.id"/>
                <label for="doctorId">Doctor</label>
            </FloatLabel>
            <FloatLabel>
                <Select v-model="appointment.methodId" :options="appointmentMethods"
                        optionLabel="name" optionValue="id" class="full-max-width" id="methodId"/>
                <label for="methodId">Método</label>
            </FloatLabel>
            <FloatLabel>
                <Select v-model="appointment.statusId" :options="selectableStatuses"
                        optionLabel="name" optionValue="id" class="full-max-width" id="statusId"/>
                <label for="statusId">Estado</label>

            </FloatLabel>

            <div class="flex row row-justify-end gap-1">
                <Button label="Cancelar" icon="pi pi-times" class="p-button-secondary" :disabled="loading"
                        @click="showCreator = false" fluid/>
                <Button label="Guardar" icon="pi pi-save" @click="updateAppointment" fluid :disabled="loading"
                        v-if="appointment.id"/>
                <Button label="Crear" icon="pi pi-check" @click="createAppointment" fluid :disabled="loading"
                        v-else/>
            </div>
        </div>
    </Dialog>

    <div class="absolute top-0-5 left-0-5">
        <Button icon="pi pi-chevron-left" @click="$emit('profile')" severity="secondary" rounded/>
    </div>
</template>

<style>

</style>