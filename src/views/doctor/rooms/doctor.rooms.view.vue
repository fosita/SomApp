<script>
import toastMessages from "@/services/toasts/toast.messages.service.js";
import getRoomsPerDoctor from "@/services/rooms/get.rooms.per.doctor.service.js";
import createRoomService from "@/services/rooms/create.room.service.js";
import updateRoomService from "@/services/rooms/update.room.service.js";
import deleteRoomService from "@/services/rooms/delete.room.service.js";
import {HttpStatusCode} from "axios";
import {handleError} from "vue";

export default {
    name: "Rooms selector",
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
        async loadRooms(){
            try {
                const res = await getRoomsPerDoctor(this.doctor.id);
                if (res.error) return handleError(res, "Error al cargar consultorios");
                this.$toast?.add(toastMessages.roomsLoaded(this.doctor));
                this.rooms = res.response;
            } finally { this.loading = false }
        },
        askToDelete(room){
            if(!room) return;
            this.$confirm.require({
                group: 'html',
                message: `¿Estás seguro de que deseas eliminar este consultorio?`,
                header: 'Confirmar Eliminación',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Eliminar',
                rejectLabel: 'Cancelar',
                rejectClass: 'p-button-secondary',
                accept: () => { this.delete(room); },
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
        async delete(room){
            try {
                this.processing = true;
                const res = await deleteRoomService(this.doctor.id, room);
                if (res.error) return this.handleError(res, "Error al eliminar consultorio");
                this.$toast?.add({
                    severity: 'success',
                    summary: 'Eliminación exitosa',
                    detail: 'El consultorio se ha eliminado exitosamente',
                    life: 4000
                });
                this.showDialog = false;
                this.rooms = this.rooms.filter(r => r.id !== room.id);
            } finally { this.processing = false }
        },
        async create(){
            try {
                this.processing = true;
                const res = await createRoomService(this.doctor.id, this.roomForm);
                if (res.error) return this.handleError(res, "Error al cargar consultorio");
                this.$toast?.add({
                    severity: 'success',
                    summary: 'Creación exitosa',
                    detail: `Se ha creado el consultorio exitosamente`,
                    life: 4000
                });
                this.rooms.push(res.response);
                this.showDialog = false;
            } finally { this.processing = false; }
        },
        async update(){
            try {
                this.processing = true;
                const res = await updateRoomService(this.doctor.id, this.roomForm);
                if (res.error) return this.handleError(res, "Error al actualizar consultorio");
                this.$toast?.add({
                    severity: 'success',
                    summary: 'Actualización exitosa',
                    detail: `Se ha actualizado el consultorio exitosamente`,
                    life: 4000
                });
                this.rooms = this.rooms.filter(r => r.id !== this.roomForm.id)
                this.rooms.push(res.response);
                this.showDialog = false;
            } finally { this.processing = false }
        },
        editRoom(room) { this.roomForm = room; this.roomForm.doctorId = this.doctor.id; this.showDialog = true; },
        newRoom() { this.roomForm = { doctorId: this.doctor.id, name: "", address: "" }; this.showDialog = true; },
        doctorName() { return `${this.doctor.name} ${this.doctor.lastname}` },
        toStrDate(date) { const d = new Date(date); return d.toLocaleDateString(); },
    },
    data() {
        return {
            roomForm: null,
            rooms: [],
            loading: true,
            showDialog: false,
            processing: false,
        }
    },
    created() {
        if (!this.doctor) return this.$emit('logout');
        this.loadRooms()
    }
}
</script>

<template>
    <div class="flex col center margin-auto gap-1" v-if="loading && doctor">
        <div class="text-center text-gray-500">
            Cargando habitaciones de {{ doctorName() }}...
        </div>
        <i class="pi pi-spin pi-spinner font-40"/>
    </div>
    <div class="flex col center margin-auto gap-1" v-else-if="doctor">
        <h1 class="text-2xl font-bold text-center">Gestión de Consultorios</h1>
        <div class="flex-grow p-4">
            <div v-if="rooms.length === 0" class="text-center text-gray-500">
                No hay consultorios registrados. Por favor, añade o vincula un consultorio.
            </div>
            <div v-else class="flex row flex-wrap gap-1 center">
                <Card v-for="room in rooms" :key="room.id">
                    <template #title>
                        {{ room.name }}
                    </template>
                    <template #content>
                        <div class="flex col margin-bottom-1 col-center-left">
                            <p>Dirección: {{ room.address }}</p>
                        </div>
                        <div class="flex col gap-0-5 max-width">
                            <Button @click="editRoom(room)" :disabled="processing" label="Editar"/>
                            <Button @click="askToDelete(room)" severity="secondary" :disabled="processing">
                                Eliminar
                            </Button>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
        <div class="flex col center gap-0-5 buttons-container">
            <Button @click="newRoom" fluid severity="secondary" :disabled="processing" label="Crear"/>
            <Button @click="$emit('profile')" fluid :disabled="processing" label="Volver"/>
        </div>
    </div>

    <Dialog v-model:visible="showDialog" :modal="true" :pt="{ root: { class: 'border-radius-1' } }"
            :header="roomForm && roomForm.id ? 'Editar Consultorio' : 'Crear Consultorio'"
            :style="{ width: '22rem' }" @hide="close">
        <div class="flex col gap-1 center">
            <InputText v-model="roomForm.name" placeholder="Nombre" class="full-max-width"/>
            <InputText v-model="roomForm.address" placeholder="Dirección" class="full-max-width"/>
            <div class="flex row gap-0-5 justify-end max-width">
                <Button label="Cancelar" icon="pi pi-times" severity="secondary" :disabled="processing"
                        @click="showDialog = false" fluid/>
                <Button :label="roomForm.id?'Actualizar':'Crear'" icon="pi pi-check" :disabled="processing"
                        @click="roomForm.id?update():create()" fluid/>
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