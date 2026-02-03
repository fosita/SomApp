<script>
export default {
    name: "Test View",
    props: {
        user: Object,
        parent: Object,
    },
    data() {
        return {
            loading: true,
        };
    },
    methods: {
        parentName() {
            if (this.parent?.name) {
                return this.parent.name;
            }
            if (this.user?.name) {
                return this.user.name;
            }
            return 'el padre/madre';
        },
    },
    async beforeMount() {
        if (!this.user) {
            this.$toast?.add({
                severity: 'error',
                summary: 'Sesión expirada',
                detail: 'Por favor, inicie sesión de nuevo.',
                life: 3000
            });
            return this.$emit('logout');
        }
        if (!this.parent) {
            this.$toast?.add({
                severity: 'error',
                summary: 'No se ha seleccionado un padre/madre',
                detail: 'Por favor, seleccione un padre/madre.',
                life: 3000
            });
            return this.$emit('parent', null);
        }
    },
}
</script>

<template>
    <div class="flex col center margin-auto gap-1" v-if="loading">
        <div class="text-center text-gray-500">
            Cargando niños de {{ parentName() }}...
        </div>
        <i class="pi pi-spin pi-spinner font-40"></i>
    </div>
</template>

<style scoped>

</style>