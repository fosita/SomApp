<script>
import poweredByGpt from "@/components/powered.by.gpt.component.vue";
import abstractRoutes from "@/router/abstract.routes.js";
export default {
    components: { poweredByGpt },
    name: "register selector",
    emits: ["patientCreator", "doctorCreator", "login", "declareRoute"],
    methods: {
        login() { this.$emit("login") },
        welcome() { this.$emit("welcome") },
        registerPatient() { this.$emit("patientCreator") },
        registerDoctor() { this.$emit("doctorCreator") }
    },
    created() { this.$emit('declareRoute', abstractRoutes.register) }
}
</script>

<template>
    <div id="login">
        <div class="flex col center margin-top-3" v-motion-slide-bottom :duration="1000">
            <h1 class="white font-36px text-shadow">Registrarme</h1>
        </div>
        <div class="flex col center gap-1 margin-bottom-4">
            <div class="flex row center margin-top-2 gap-1-over-800"
                 v-motion-slide-bottom :duration="1000" :delay="200">
                <div class="flex col center hover-scale-105 animate-all-200 text-button"
                     @click="registerDoctor">
                    <img class="size-120 size-150-over-400 size-200-over-800"
                         alt="" src="/doctor_small.svg"/>
                    <div class="white font-20px-over-400 font-30px-over-800">Doctor</div>
                </div>
                <div class="flex col center hover-scale-105 animate-all-200 text-button"
                     @click="registerPatient">
                    <img class="size-120 size-150-over-400 size-200-over-800"
                         alt="" src="/patient_small.svg"/>
                    <div class="white font-20px-over-400 font-30px-over-800">Paciente</div>
                </div>
            </div>
            <div class="flex col center text-button white" @click="login"
                 v-motion-slide-bottom :duration="1000" :delay="400">
                ¿Ya tienes una cuenta?
            </div>
            <Button class="login-button" severity="secondary" label="Volver" @click="welcome"
                    v-motion-slide-bottom :duration="1000" :delay="600"/>
        </div>
        <poweredByGpt color="white"/>
    </div>

</template>

<style scoped>
/*Define an animation*/
.text-shadow { text-shadow: 4px 4px 4px rgba(0, 0, 0, 0.25) }

/* create an style that aplies the animation */
.white,
.white input { color: white !important }
</style>