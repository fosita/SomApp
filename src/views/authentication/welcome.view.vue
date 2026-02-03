<script>
import poweredByGpt from "@/components/powered.by.gpt.component.vue";

export default {
    name: "welcome",
    components: {poweredByGpt},
}
</script>

<template>
    <div id="login" class="flex col center gap-1 margin-auto">
        <img src="/healthcare_personal.svg" alt="healthcare" class="size-200 margin-top-3"
             v-motion-slide-bottom :duration="1000"/>
        <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="400">
            <h1 class="font-64px lh-72px text-shadow white">Somapp</h1>
            <div class="font-18px lh-2 text-shadow white">¡Juntos venceremos el cancer!</div>
        </div>
        <div class="flex row center gap-0-5 margin-bottom-4" v-motion-slide-bottom :duration="1000" :delay="800">
            <Button class="box-shadow login-button" severity="secondary" @click="$emit('register')">
                Registrarse
            </Button>
            <Button class="box-shadow login-button" severity="primary" @click="$emit('login')">
                Iniciar Sesión
            </Button>

        </div>
        <poweredByGpt color="white"/>
    </div>
</template>

<style scoped>
/*Define an animation*/
.text-shadow { text-shadow: 4px 4px 4px rgba(0, 0, 0, 0.25) }
.box-shadow { box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.25) }
.login-button { width: 8rem }
</style>