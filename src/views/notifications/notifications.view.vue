<script>
import getNotifications from "@/services/notifications/get.notifications.service.js";
import getDoctorsPerPatient from "@/services/patients/get.doctors.per.patient.js";
import sentNotification from "@/services/notifications/send.notification.service.js";
import deleteNotification from "@/services/notifications/delete.notification.service.js";
import {HttpStatusCode} from "axios";

export default {
    name: "notifications",
    props: { doctor: Object, patient: Object, notificationSeverities: Array },
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
            this.loading = true;
            try {
                const doctors = await getDoctorsPerPatient(this.patient.id);
                if(doctors.error) return this.handleError(doctors, "Error al cargar médicos");
                this.doctors = doctors.response;
            } catch (error) { console.error("Error fetching doctors:", error) }
            finally { this.loading = false }
        },
        async getNotifications() {
            this.loading = true;
            try {
                const res = await getNotifications(this.patient.id, this.doctor?.id);
                if(res.error) return this.handleError(res, "Error al cargar notificaciones");
                this.notifications = res.response;
            } catch (error) { console.error("Error al cargar notificaciones:", error) }
            finally { this.loading = false }
        },
        getSeverity(id) { return this.notificationSeverities.find(s=>s.id === id).code },
        async updateExample(){
            this.$toast.removeAllGroups();
            this.notification.severity = this.getSeverity(this.notification.severityId);
            this.$toast.add(this.notification);
        },
        async createNotification(){
            if(!this.notification.summary) return this.$toast.add({
                severity: 'warn',
                summary: 'Título faltante',
                detail: 'Por favor, ingrese un título para la notificación.',
                life: 5000,
            });
            if(!this.notification.detail) return this.$toast.add({
                severity: 'warn',
                summary: 'Contenido faltante',
                detail: 'Por favor, ingrese el contenido de la notificación.',
                life: 5000,
            });
            if(!this.notification.severityId) return this.$toast.add({
                severity: 'warn',
                summary: 'Tipo de notificación faltante',
                detail: 'Por favor, seleccione un tipo de notificación.',
                life: 5000,
            });
            const response = await sentNotification(this.patient.id, this.doctor.id, this.notification)
            if(response.error) return this.handleError(response, "Error al crear notificación");
            this.$toast.add({
                severity: 'success',
                summary: 'Notificación creada',
                detail: 'La notificación se ha creado correctamente.',
                life: 5000,
            });
            this.showCreator = false;
            await this.getNotifications();
        },
        doctorName(doctorId) {
            const doctor = this.doctors.find(doc => doc.id === doctorId);
            return doctor ? `${doctor.name} ${doctor.lastname}` : "Desconocido";
        },
        showNotification(notification){
            this.$toast.add({
                severity: this.getSeverity(notification.severityId),
                summary: notification.summary,
                detail: notification.detail,
                life: 5000
            });
        },
        async deleteNotification(notification){
            this.loading = true
            const res = await deleteNotification(this.patient.id, this.doctor?.id, notification.id);
            if(res.error) return this.handleError(res, "Error al eliminar notificación");

            this.$toast.add({
                severity: 'success',
                summary: 'Notificación eliminada',
                detail: 'La notificación se ha eliminado correctamente.',
                life: 5000,
            });
            await this.getNotifications();
            this.loading = false
        }
    },
    data() {
        return {
            loading: true,
            doctors: null,
            notifications: null,
            showCreator: false,
            notification: {
                summary: "",
                detail: "",
                severityId: null,
            }
        };
    },
    async created() {
        await this.getDoctors();
        await this.getNotifications();
    },
    watch: {
        showCreator: {
            handler(visible) {
                this.notification.summary = "";
                this.notification.detail = "";
                this.$toast.removeAllGroups();
            }
        }
    }
}
</script>

<template>
    <div class="flex col center gap-1 padding-1">
        <h2 class="font-24px lh-32px">Notificaciones</h2>
        <div v-if="loading" class="flex col center gap-1">
            <i class="pi pi-spinner pi-spin" style="font-size: 2rem"/>
            <div>Cargando notificaciones...</div>
        </div>
        <div v-else-if="notifications && notifications.length === 0" class="flex col center gap-1">
            <i class="pi pi-inbox" style="font-size: 2rem"/>
            <div>No hay notificaciones creadas</div>
        </div>
        <div v-else class="flex row flex-wrap max-width center gap-1">
            <Card v-for="notification in notifications" :key="notification.id" style="width: 300px;">
                <template #content>
                    <div class="font-18px lh-22px"> {{notification.summary}} </div>
                    <div class="font-16px lh-18px"> {{notification.detail}} </div>
                    <div class="font-12px">Creado por: {{doctorName(notification.doctorId)}}</div>
                    <div class="font-12px" v-if="!doctor">Leído {{notification.shown?'Sí':'No'}}</div>
                    <div class="font-12px lh-16px text-secondary">
                        {{new Date(notification.createdAt).toLocaleString()}}
                    </div>

                    <div class="flex row max-width gap-0-5 margin-top-0-5">
                        <Button fluid label="Mostrar" icon="pi pi-info-circle" severity="primary"
                                @click="showNotification(notification)" size="small"/>
                        <Button fluid label="Eliminar" icon="pi pi-trash" severity="danger"
                                @click="deleteNotification(notification)" size="small"/>
                    </div>
                </template>
            </Card>
        </div>
        <div class="flex row center gap-1">
            <Button label="Actualizar" icon="pi pi-refresh" @click="getNotifications"/>
            <Button label="Agregar" icon="pi pi-plus" @click="showCreator = true" v-if="doctor"/>
        </div>
    </div>

    <Dialog header="Crear Notificación" v-model:visible="showCreator" :modal="true" :closable="true"
            :dismissable-mask="true" :style="{width: '400px'}">
        <div class="flex col gap-1 max-width">
            <Select v-model="notification.severityId" optionValue="id" optionLabel="name"
                    :options="notificationSeverities" placeholder="Tipo de notificación"
                    @change="updateExample" class="full-max-width"/>
            <InputText v-model="notification.summary" placeholder="Título" class="full-max-width"
                       @focusout="updateExample"/>
            <Textarea v-model="notification.detail" placeholder="Contenido" rows="5"
                      class="full-max-width" @focusout="updateExample"/>
            <div class="flex row row-justify-end gap-1">
                <Button label="Cancelar" icon="pi pi-times" class="p-button-secondary"
                        @click="showCreator = false" fluid/>
                <Button label="Crear" icon="pi pi-check" @click="createNotification" fluid/>
            </div>
        </div>
    </Dialog>

    <div class="absolute top-0-5 left-0-5">
        <Button icon="pi pi-chevron-left" @click="$emit('profile')" severity="secondary" rounded/>
    </div>
</template>

<style>

</style>