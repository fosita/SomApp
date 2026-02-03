<script>
import validateOtp from "@/services/authentication/otp.service.js";
export default {
    name: 'OtpView',
    props: { user: Object },
    data() { return { otp: '' } },
    methods: {
        close() { this.$emit('close'); },
        async validateOtp() {
            if(!this.otp || this.otp.length !== 6) return this.$toast.add({
                severity: 'warn',
                summary: 'Código inválido',
                detail: 'Por favor, ingresa un código OTP válido de 6 dígitos.',
                life: 3000
            });
            try{
                const res = await validateOtp(this.user.id, this.otp)
                if (res.error) {
                    this.$toast.add({
                        severity: 'error',
                        summary: 'Error al validar OTP',
                        detail: res.error,
                        life: 3000
                    });
                    return this.$emit('close');
                }
                this.$emit('login', res.response);
            } catch (error) {
                console.error('Error al validar OTP:', error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error al validar OTP',
                    detail: 'Ocurrió un error inesperado al validar el código OTP.',
                    life: 3000
                });
            }
        }
    },
}
</script>

<template>
    <div class="fixed flex col col-top-center left-0 right-0 bottom-0 top-0 bg-black z-20">
        <Card  style="max-width: 400px" class="margin-auto ">
            <template #content>
                <div style="max-width: 400px" class="flex col center gap-0-5">
                    <p class="font-20px">Autenticación de dos factores</p>
                    <p>Se ha enviado un código de verificación al número de Whatsapp asociado a la cuenta.</p>
                    <InputOtp v-model="otp" label="Código OTP" placeholder="Ingresa tu código OTP aquí"
                              id="otp" :length="6" inputClass="otp"/>

                    <div class="flex row center max-width gap-0-5">
                        <Button label="Cerrar" severity="secondary" @click="close" fluid/>
                        <Button label="Validar OTP" class="p-mt-3" @click="validateOtp" fluid/>
                    </div>

                </div>
            </template>
        </Card>
    </div>
</template>

<style>
.bg-black { background-color: rgba(0, 0, 0, 0.5) }
.z-20 { z-index: 20 }
#otp { max-width: 400px!important }
#otp .p-inputotp-input{
    max-width: 50px!important;
    min-width: unset!important;
    width: unset!important;
}
</style>