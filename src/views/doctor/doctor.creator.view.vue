<script>
import register from "@/services/authentication/register.service.js";
import sexes from "@/services/patients/sexes.values.js";
import poweredByGpt from "@/components/powered.by.gpt.component.vue";
import userRoles from "@/shared/data/user.roles.js";
//calc date of 18 years ago
const maxRegDate = new Date();
maxRegDate.setFullYear(maxRegDate.getFullYear() - 18);
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export default {
    name: "create doctor",
    emits: ['login'],
    components: {poweredByGpt},
    props: { universities: Array, specialities: Array },
    data() {
        return {
            emailRegex,
            maxRegDate,
            sexes,
            doctor: {
                roleId: userRoles.doctor,
                dniCe: "",
                name: "",
                lastname: "",
                birthdate: null,
                sex: null,
                phone: "",
                email: "",
                username: "",
                password: "",
                repeatPassword: "",
                universityId: null,
                specialityId: null,
                egresateDate: null,
                cmp: "",
                rne: "",
            },
            doctorErrors: {
                dniCe: false,
                name: false,
                lastname: false,
                birthdate: false,
                sex: false,
                phone: false,
                email: false,
                username: false,
                password: false,
                universityId: false,
                specialityId: false,
                egresateDate: false,
                cmp: false,
                rne: false,
            },

            processing: false,
        }
    },
    methods: {
        login(data = null){ this.$emit('login', data) },
        isString(value) { return typeof value === 'string'; },
        focusElement(id) {
            this.$nextTick(() => {
                const element = document.getElementById(id);
                if (!element) return;
                if (element.tagName === 'INPUT') {
                    element.focus();
                    element.select();
                } else {
                    const input = element.querySelector('input');
                    if (input) {
                        input.focus();
                        input.select();
                    } else { element.focus(); }
                }
            });
        },
        validateDoctorFields(silent = false) {
            for (const key in this.doctorErrors) this.doctorErrors[key] = false;

            const regSpecialChars = `!#%&%=*+\\-_.,:;?@<>()\\[\\]{}|^~¡¿°$€£¥₿`;
            const LowercaseRegex = /[a-zñáéíóú]/;
            const UppercaseRegex = /[A-ZÑÁÉÍÓÚ]/;
            const DigitRegex = /\d/;
            const SpecialCharRegex = new RegExp(`[${regSpecialChars}]`);
            const passwordRegex = new RegExp(
                `^(?=.*${DigitRegex.source})`+
                `(?=.*${LowercaseRegex.source})` +
                `(?=.*${UppercaseRegex.source})` +
                `(?=.*[${regSpecialChars}]).{8,}$`
            );

            if(!this.doctor.roleId) this.doctor.roleId = userRoles.doctor;
            if(!this.doctor.dniCe){
                this.focusElement('dniCe');
                if (silent) return false;
                this.doctorErrors.dniCe = "El DNI o CE es requerido";
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El DNI o CE es requerido',
                    life: 3000
                });
            }
            if(!(this.doctor.dniCe.length === 8 || this.doctor.dniCe.length === 20)){
                this.focusElement('dniCe');
                if (silent) return false;
                this.doctorErrors.dniCe = "El DNI o CE no es válido";
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El DNI o CE no es válido',
                    life: 3000
                });
            }

            if (!this.doctor.name) {
                this.focusElement('name');
                if (silent) return false;
                this.doctorErrors.name = "El nombre es requerido";
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El nombre es requerido',
                    life: 3000
                });
            }
            if (!this.doctor.lastname) {
                this.focusElement('lastname');
                if (silent) return false;
                this.doctorErrors.lastname = "El apellido es requerido";
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El apellido es requerido',
                    life: 3000
                });
            }

            if(!this.doctor.birthdate){
                this.focusElement('birthdate');
                if (silent) return false;
                this.doctorErrors.birthdate = 'La fecha de nacimiento es requerida';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La fecha de nacimiento es requerida',
                    life: 3000
                });
            }

            if(this.doctor.sex === null){
                this.focusElement('sex');
                if (silent) return false;
                this.doctorErrors.sex = 'El sexo es requerido';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El sexo es requerido',
                    life: 3000
                });
            }

            if(!this.doctor.phone){
                this.focusElement('phone');
                if (silent) return false;
                this.doctorErrors.sex = 'El teléfono es requerido';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El teléfono es requerido',
                    life: 3000
                });
            }

            if (!this.doctor.email) {
                this.focusElement('email');
                if (silent) return false;
                this.doctorErrors.email = 'El correo electrónico es requerido';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El correo electrónico es requerido',
                    life: 3000
                });
            }
            if (!emailRegex.test(this.doctor.email)) {
                this.focusElement('email');
                if (silent) return false;
                this.doctorErrors.email = 'El correo electrónico no es valido';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El correo electrónico no es valido',
                    life: 3000
                });
            }


            if (!this.doctor.username) {
                this.focusElement('username');
                if (silent) return false;
                this.doctorErrors.username = 'El usuario es requerido';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El usuario es requerido',
                    life: 3000
                });
            }
            if (!this.doctor.password) {
                this.focusElement('password');
                if (silent) return false;
                this.doctorErrors.password = 'La contraseña es requerida';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La contraseña es requerida',
                    life: 3000
                });
            }
            if(this.doctor.password.length < 8){
                this.focusElement('password');
                if (silent) return false;
                this.doctorErrors.password = 'Debe tener al menos 8 caracteres';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La contraseña debe tener al menos 8 caracteres',
                    life: 3000
                });
            }

            if(!LowercaseRegex.test(this.doctor.password)) {
                this.focusElement('password');
                if (silent) return false;
                this.doctorErrors.password = 'Debe tener al menos una minúscula';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La contraseña debe tener al menos una minúscula',
                    life: 3000
                });
            }
            if(!UppercaseRegex.test(this.doctor.password)) {
                this.focusElement('password');
                if (silent) return false;
                this.doctorErrors.password = 'Debe tener al menos una mayúscula';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La contraseña debe tener al menos una mayúscula',
                    life: 3000
                });
            }
            if(!DigitRegex.test(this.doctor.password)) {
                this.focusElement('password');
                if (silent) return false;
                this.doctorErrors.password = 'Debe tener al menos un número';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La contraseña debe tener al menos un número',
                    life: 3000
                });
            }
            if(!SpecialCharRegex.test(this.doctor.password)) {
                this.focusElement('password');
                if (silent) return false;
                this.doctorErrors.password = '<div>Debe tener al menos un caracter especial</div>' +
                    `<div>Lista: ${regSpecialChars.replace(/\\/g, '')}</div>`;
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La contraseña debe tener al menos un carácter especial',
                    life: 3000
                });
            }
            
            
            if (!passwordRegex.test(this.doctor.password)) {
                this.focusElement('password');
                if (silent) return false;
                this.doctorErrors.password = '<div>Debe tener al menos 8 caracteres, una mayúscula,</div>' +
                    '<div>una minúscula, un número y un caracter especial</div>';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, ' +
                        'una minúscula, un numero y un carácter especial',
                    life: 3000
                });
            }


            if (!this.doctor.repeatPassword) {
                this.focusElement('repeatPassword');
                if (silent) return false;
                this.doctorErrors.repeatPassword = 'Debe repetir la contraseña';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'Debe repetir la contraseña',
                    life: 3000
                });
            }
            if (this.doctor.password !== this.doctor.repeatPassword) {
                this.focusElement('repeatPassword');
                if (silent) return false;
                this.doctorErrors.password = 'Las contraseñas no coinciden';
                this.doctorErrors.repeatPassword = 'Las contraseñas no coinciden';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'Las contraseñas no coinciden',
                    life: 3000
                });
            }


            if(!this.doctor.universityId){
                this.focusElement('university');
                if (silent) return false;
                this.doctorErrors.universityId = 'La universidad es requerida';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La universidad es requerida',
                    life: 3000
                });
            }
            if(!this.doctor.egresateDate){
                this.focusElement('egresateDate');
                if (silent) return false;
                this.doctorErrors.egresateDate = 'La fecha de egreso es requerida';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La fecha de egreso es requerida',
                    life: 3000
                });
            }
            if(!this.doctor.cmp){
                this.focusElement('cmp');
                if (silent) return false;
                this.doctorErrors.cmp = 'El CMP es requerido';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El código del Colegio Médico del Perú es requerido',
                    life: 3000
                });
            }

            return true;
        },

        async register() {
            if (!this.validateDoctorFields()) return;
            try {
                this.processing = true;
                let {response: doctor, error: doctorError} = await register(this.doctor)
                if (doctorError) {
                    this.stage = 0

                    for (const key in this.doctorErrors) this.doctorErrors[key] = true;

                    return this.$toast.add({
                        severity: 'warn',
                        summary: 'Error al registrar el doctor',
                        detail: doctorError,
                        life: 3000
                    });
                }
                localStorage.removeItem('create_doctor');
                this.login(doctor)
            }
            catch (e) { console.error(e) }
            finally { this.processing = false; }
        },
        back (){ this.$router.back() }
    },
    created() {
        let savedDoctor = localStorage.getItem('create_doctor');
        if (!savedDoctor) return;
        savedDoctor = JSON.parse(savedDoctor);
        if(savedDoctor.birthdate) savedDoctor.birthdate = new Date(savedDoctor.birthdate);
        else savedDoctor.birthdate = null;
        if(savedDoctor.egresateDate) savedDoctor.egresateDate = new Date(savedDoctor.egresateDate);
        else savedDoctor.egresateDate = null;
        this.doctor = savedDoctor;
        console.log('Restored data from localStorage', this.doctor);
    },
    watch: {
        doctor: {
            handler(newValue) {
                for (const key in this.doctorErrors) this.doctorErrors[key] = false;
                localStorage.setItem('create_doctor', JSON.stringify(newValue));
            },
            deep: true
        }
    }
}
</script>

<template>
    <div id="login">
        <div class="flex col center margin-top-3" v-motion-slide-bottom :duration="1000">
            <h1 class="white font-36px text-shadow">Regístrate</h1>
        </div>


        <div class="flex col center gap-1 margin-bottom-4">
            <div class="white font-19px text-shadow" v-motion-slide-bottom :duration="1000" :delay="200">
                Datos del doctor
            </div>
            <div class="flex col center gap-0-5">
                <div class="flex col center"  v-motion-slide-bottom :duration="1000" :delay="250">
                    <InputText v-model="doctor.dniCe" placeholder="DNI o CE" maxlength="20"
                               :invalid="doctorErrors.dniCe" id="dniCe" class="white"/>
                    <div class="max-width red font-12px text-center" v-if="isString(doctorErrors.dniCe)"
                         v-html="doctorErrors.dniCe"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="300">
                    <InputText v-model="doctor.name" placeholder="Nombres" maxlength="100"
                               :invalid="doctorErrors.name" id="name" class="white"/>
                    <div class="max-width red font-12px text-center" v-if="isString(doctorErrors.name)"
                         v-html="doctorErrors.name"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="350">
                    <InputText v-model="doctor.lastname" placeholder="Apellidos" maxlength="100"
                               :invalid="doctorErrors.lastname" id="lastname" class="white"/>
                    <div class="max-width red font-12px text-center" v-if="isString(doctorErrors.lastname)"
                         v-html="doctorErrors.lastname"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="400">
                    <Calendar v-model="doctor.birthdate" placeholder="Fecha de Nacimiento" class="white"
                              :invalid="doctorErrors.birthdate" id="birthdate" :maxDate="maxRegDate"/>
                    <div class="red font-12px text-center" v-if="isString(doctorErrors.birthdate)"
                         v-html="doctorErrors.birthdate"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="450">
                    <Select id="sex" placeholder="Sexo" :invalid="doctorErrors.sex" class="white"
                            v-model="doctor.sex" :options="sexes" optionLabel="label" optionValue="value"/>
                    <div class="red font-12px text-center" v-if="isString(doctorErrors.sex)"
                         v-html="doctorErrors.sex"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="500">
                    <InputText v-model="doctor.phone" placeholder="Teléfono" v-keyfilter="/^[0-9\-+\s]+$/"
                               :invalid="doctorErrors.phone" id="phone" maxlength="30" class="white"/>
                    <div class="max-width red font-12px text-center" v-if="isString(doctorErrors.phone)"
                         v-html="doctorErrors.phone"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="550">
                    <InputText v-model="doctor.email" placeholder="Correo electrónico"
                               :invalid="doctorErrors.email" id="email" maxlength="100" class="white"/>
                    <div class="max-width red font-12px text-center" v-if="isString(doctorErrors.email)"
                         v-html="doctorErrors.email"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="600">
                    <InputText v-model="doctor.username" placeholder="Usuario" maxlength="100"
                               :invalid="doctorErrors.username" id="username" class="white"
                               v-keyfilter="/^[0-9a-zA-ZñÑáéíóúÁÉÍÓÚ_-]+$/"/>
                    <div class="max-width red font-12px text-center" v-if="isString(doctorErrors.username)"
                         v-html="doctorErrors.username"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="650">
                    <Password v-model="doctor.password" placeholder="Contraseña" toggleMask
                              class="white" :invalid="doctorErrors.password"
                              :feedback="false" id="password"/>
                    <div class="red font-12px text-center" v-if="isString(doctorErrors.password)"
                         v-html="doctorErrors.password"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="700">
                    <Password v-model="doctor.repeatPassword" placeholder="Repite la Contraseña"
                              toggleMask class="white" :invalid="doctorErrors.password"
                              :feedback="false" id="repeatPassword"/>
                    <div class="red font-12px text-center" v-if="isString(doctorErrors.repeatPassword)"
                         v-html="doctorErrors.repeatPassword"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="750">
                    <Select v-model="doctor.universityId" placeholder="Universidad" id="university" filter
                            :options="universities" optionLabel="name" optionValue="id" class="white"/>
                    <div class="red font-12px text-center" v-if="isString(doctorErrors.universityId)"
                            v-html="doctorErrors.universityId"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="800">
                    <Select v-model="doctor.specialityId" placeholder="Especialidad (Opcional)" id="speciality" filter
                            :options="specialities" optionLabel="name" optionValue="id" class="white"/>
                    <div class="red font-12px text-center" v-if="isString(doctorErrors.specialityId)"
                            v-html="doctorErrors.specialityId"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="850">
                    <Calendar v-model="doctor.egresateDate" placeholder="Fecha de Egreso" class="white"
                              id="egresateDate" :maxDate="maxRegDate"/>
                    <div class="red font-12px text-center" v-if="isString(doctorErrors.egresateDate)"
                         v-html="doctorErrors.egresateDate"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="900">
                    <InputText v-model="doctor.cmp" placeholder="Código del Colegio Médico del Perú (CMP)"
                               maxlength="20" :invalid="doctorErrors.cmp" id="cmp" class="white"/>
                    <div class="max-width red font-12px text-center" v-if="isString(doctorErrors.cmp)"
                         v-html="doctorErrors.cmp"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="950">
                    <InputText v-model="doctor.rne" placeholder="Registro Nacional de Especialistas (RNE) (Opcional)"
                               maxlength="20" :invalid="doctorErrors.rne" id="rne" class="white"/>
                    <div class="max-width red font-12px text-center" v-if="isString(doctorErrors.rne)"
                         v-html="doctorErrors.rne"/>
                </div>
            </div>
            
            <div class="flex col center text-button white" @click="login()"
                 v-motion-slide-bottom :duration="1000" :delay="1100">
                ¿Ya tienes una cuenta?
            </div>


            <div class="flex row gap-0-5" v-motion-slide-bottom :duration="1000" :delay="1300">
                <Button class="box-shadow login-button" severity="secondary"
                        @click="back" :disabled="processing">
                    Volver
                </Button>
                <Button class="box-shadow login-button" @click="register" :disabled="processing">
                    Registrarme
                </Button>
            </div>
        </div>
        <poweredByGpt color="white"/>
    </div>


</template>

<style scoped>
/*Define an animation*/
.text-shadow { text-shadow: 4px 4px 4px rgba(0, 0, 0, 0.25); }
.box-shadow { box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.25); }
.login-button { width: 8rem; }

.white,
.white *,
.white input {
    color: white!important;
}
</style>