<script>
import poweredByGpt from "@/components/powered.by.gpt.component.vue";
import login from "@/services/authentication/login.service.js";
import toasts from "@/services/toasts/toast.messages.service.js";
import OtpComponent from "@/views/authentication/otp.component.vue";

export default {
    components: { poweredByGpt, OtpComponent },
    name: "login",
    data() {
        return {
            credentials: {
                username: "",
                password: "",
            },
            errors: {
                username: false,
                password: false,
            },
            processing: false,


            user: null,
            otpNeeded: false,
        }
    },
    methods: {
        startProcessing() {
            this.processing = true;
            this.errors.username = false
            this.errors.password = false
        },
        welcome(){ this.$emit('welcome') },
        async login() {
            this.startProcessing();
            try {
                const {response, error} = await login(this.credentials)
                this.processing = false;
                if (error) {
                    this.errors.username = true;
                    this.errors.password = true;
                    return this.$toast.add(toasts.warn('Error al iniciar sesión', error));
                }
                this.otpNeeded = true;
                this.user = response;
            } catch (e) { console.error(e) }
            finally { this.processing = false }
        },
        async otpValidated(user) {
            console.log("otp validated ",user);
            this.$emit('login', user) }
    },
    watch: {
        credentials: {
            handler(newValue) {
                this.errors.username = false;
                this.errors.password = false;
            },
            deep: true,
        }
    }
}
</script>

<template>
    <OtpComponent v-if="otpNeeded" :user="user" @login="otpValidated" @close="otpNeeded = false" />
    <div id="login">
        <div class="flex col center margin-top-3" v-motion-slide-bottom :duration="1000">
            <h1 class="white font-36px text-shadow">Iniciar Sesión</h1>
        </div>
        <div class="flex col center gap-1 margin-bottom-4">
            <div class="flex col center gap-0-5" v-motion-slide-bottom :duration="1000" :delay="200">
                <InputText v-model="credentials.username" :invalid="errors.username"
                           placeholder="Usuario" class="white"/>
                <Password v-model="credentials.password" :invalid="errors.password"
                          toggleMask :feedback="false" placeholder="Contraseña" class="white"/>
            </div>
            <div class="flex col center text-button white" @click="$emit('register')"
                 v-motion-slide-bottom :duration="1000" :delay="400">
                ¿No tienes una cuenta?
            </div>
            <div class="flex row gap-0-5" v-motion-slide-bottom :duration="1000" :delay="600">
                <Button class="login-button" @click="welcome" :disabled="processing"
                        label="Volver" severity="secondary"/>
                <Button class="login-button" @click="login" :disabled="processing"
                        label="Iniciar Sesión" severity="primary"/>
            </div>
        </div>
        <poweredByGpt color="white"/>
    </div>


</template>

<style>
/*Define an animation*/
.text-shadow { text-shadow: 4px 4px 4px rgba(0, 0, 0, 0.25);}
.login-button { width: 8rem; box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.25); }

.white,
.white *,
.white input {
    color: white!important;
}
</style>