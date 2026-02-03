<script>
import register from "@/services/authentication/register.service.js";
import sexes from "@/services/patients/sexes.values.js";
import anthropometricValues from "@/shared/data/anthropometric.fields.js";
import poweredByGpt from "@/components/powered.by.gpt.component.vue";
import userRoles from "@/shared/data/user.roles.js";
import Loading from "@/components/loading.component.vue";

import getAllergies from "@/services/allergies/get.allergies.service.js";
import getConditions from "@/services/conditions/get.conditions.service.js";
import linkAllergiesToPatient from "@/services/allergies/link.allergies.to.patients.service.js";
import linkConditionsToPatient from "@/services/conditions/link.conditions.to.patients.service.js";
import toasts from "@/services/toasts/toast.messages.service.js";
import linkPatientToDoctor from "@/services/doctors/link.patient.service.js";

export default {
    name: "create patient",
    components: {Loading, poweredByGpt},
    props: { doctor: Object },
    data() {
        return {
            anthropometricValues,

            sexes,
            stage: 0,
            patient: {
                roleId: userRoles.patient,
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

                weight: null,
                height: null,
            },
            patientErrors: {
                dniCe: false,
                name: false,
                lastname: false,
                birthdate: false,
                sex: false,
                phone: false,
                email: false,
                username: false,
                password: false,

                weight: null,
                height: null,
            },

            allergiesList: null,
            not_allergies: false,
            allergies: {},
            allergiesErrors: {},

            medicalConditionsList: null,
            notMedicalConditions: false,
            medicalConditions: {},
            medicalConditionsErrors: {},

            processing: false,
            internalProcessing: false
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

        async loadAllergiesList() {
            try {
                let {response, error} = await getAllergies();
                console.log(response, error)
                if (error) throw new Error(error);
                this.allergiesList = response;
                localStorage.setItem('allergies_list', JSON.stringify(response));
            } catch (e) {
                console.log(e);
                this.$toast.add(toasts.errorLoading('alergias', e.toString()));
            }
        },
        async loadMedicalConditionsList() {
            try {
                let {response, error} = await getConditions();
                if (error) throw new Error(error);
                this.medicalConditionsList = response;
                localStorage.setItem('medicalConditions_list', JSON.stringify(response));
            } catch (e) {
                console.log(e);
                this.$toast.add(toasts.errorLoading('condiciones médicas', e.toString()));
            }
        },

        saveAllergies() {
            localStorage.setItem('create_allergies', JSON.stringify(this.allergies));
            localStorage.setItem('create_allergies_extra', JSON.stringify(this.allergies_extra));
            localStorage.setItem('create_not_allergies', JSON.stringify(this.not_allergies));
        },
        saveMedicalConditions() {
            localStorage.setItem('createMedicalConditions', JSON.stringify(this.medicalConditions));
            localStorage.setItem('createMedicalConditions_extra', JSON.stringify(this.medicalConditions_extra));
            localStorage.setItem('create_notMedicalConditions', JSON.stringify(this.notMedicalConditions));
        },

        startInternalProcessing() { this.internalProcessing = true; },
        stopInternalProcessing() { this.$nextTick(() => { this.internalProcessing = false }) },

        validatePatientFields(silent = false) {
            for (const key in this.patientErrors) this.patientErrors[key] = false;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

            if(!this.patient.dniCe){
                this.focusElement('dniCe');
                if (silent) return false;
                this.patientErrors.dniCe = "El DNI o CE es requerido";
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El DNI o CE es requerido',
                    life: 3000
                });
            }
            if(!(this.patient.dniCe.length === 8 || this.patient.dniCe.length === 20)){
                this.focusElement('dniCe');
                if (silent) return false;
                this.patientErrors.dniCe = "El DNI o CE no es válido";
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El DNI o CE no es válido',
                    life: 3000
                });
            }

            if (!this.patient.name) {
                this.focusElement('name');
                if (silent) return false;
                this.patientErrors.name = "El nombre es requerido";
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El nombre es requerido',
                    life: 3000
                });
            }
            if (!this.patient.lastname) {
                this.focusElement('lastname');
                if (silent) return false;
                this.patientErrors.lastname = "El apellido es requerido";
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El apellido es requerido',
                    life: 3000
                });
            }

            if(!this.patient.birthdate){
                this.focusElement('birthdate');
                if (silent) return false;
                this.patientErrors.birthdate = 'La fecha de nacimiento es requerida';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La fecha de nacimiento es requerida',
                    life: 3000
                });
            }

            if(this.patient.sex === null){
                this.focusElement('sex');
                if (silent) return false;
                this.patientErrors.sex = 'El sexo es requerido';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El sexo es requerido',
                    life: 3000
                });
            }

            if(!this.patient.phone){
                this.focusElement('phone');
                if (silent) return false;
                this.patientErrors.sex = 'El teléfono es requerido';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El teléfono es requerido',
                    life: 3000
                });
            }

            if (!this.patient.email) {
                this.focusElement('email');
                if (silent) return false;
                this.patientErrors.email = 'El correo electrónico es requerido';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El correo electrónico es requerido',
                    life: 3000
                });
            }
            if (!emailRegex.test(this.patient.email)) {
                this.focusElement('email');
                if (silent) return false;
                this.patientErrors.email = 'El correo electrónico no es valido';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El correo electrónico no es valido',
                    life: 3000
                });
            }


            if (!this.patient.username) {
                this.focusElement('username');
                if (silent) return false;
                this.patientErrors.username = 'El usuario es requerido';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El usuario es requerido',
                    life: 3000
                });
            }
            if (!this.patient.password) {
                this.focusElement('password');
                if (silent) return false;
                this.patientErrors.password = 'La contraseña es requerida';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La contraseña es requerida',
                    life: 3000
                });
            }
            if(this.patient.password.length < 8){
                this.focusElement('password');
                if (silent) return false;
                this.patientErrors.password = 'Debe tener al menos 8 caracteres';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La contraseña debe tener al menos 8 caracteres',
                    life: 3000
                });
            }
            if(!LowercaseRegex.test(this.patient.password)) {
                this.focusElement('password');
                if (silent) return false;
                this.patientErrors.password = 'Debe tener al menos una minúscula';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La contraseña debe tener al menos una minúscula',
                    life: 3000
                });
            }
            if(!UppercaseRegex.test(this.patient.password)) {
                this.focusElement('password');
                if (silent) return false;
                this.patientErrors.password = 'Debe tener al menos una mayúscula';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La contraseña debe tener al menos una mayúscula',
                    life: 3000
                });
            }
            if(!DigitRegex.test(this.patient.password)) {
                this.focusElement('password');
                if (silent) return false;
                this.patientErrors.password = 'Debe tener al menos un número';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La contraseña debe tener al menos un número',
                    life: 3000
                });
            }
            if(!SpecialCharRegex.test(this.patient.password)) {
                this.focusElement('password');
                if (silent) return false;
                this.patientErrors.password = '<div>Debe tener al menos un caracter especial</div>' +
                    `<div>Lista: ${regSpecialChars.replace(/\\/g, '')}</div>`;
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La contraseña debe tener al menos un carácter especial',
                    life: 3000
                });
            }
            if (!passwordRegex.test(this.patient.password)) {
                this.focusElement('password');
                if (silent) return false;
                this.patientErrors.password = '<div>Debe tener al menos 8 caracteres, una mayúscula,</div>' +
                    '<div>una minúscula, un número y un caracter especial</div>';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, ' +
                        'una minúscula, un numero y un carácter especial',
                    life: 3000
                });
            }


            if (!this.patient.repeatPassword) {
                this.focusElement('repeatPassword');
                if (silent) return false;
                this.patientErrors.repeatPassword = 'Debe repetir la contraseña';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'Debe repetir la contraseña',
                    life: 3000
                });
            }
            if (this.patient.password !== this.patient.repeatPassword) {
                this.focusElement('repeatPassword');
                if (silent) return false;
                this.patientErrors.password = 'Las contraseñas no coinciden';
                this.patientErrors.repeatPassword = 'Las contraseñas no coinciden';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'Las contraseñas no coinciden',
                    life: 3000
                });
            }

            if(!this.patient.weight){
                this.focusElement('weight');
                if (silent) return false;
                this.patientErrors.weight = 'El peso es requerido';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'El peso es requerido',
                    life: 3000
                });
            }
            if(!this.patient.height){
                this.focusElement('height');
                if (silent) return false;
                this.patientErrors.height = 'La altura es requerida';
                return this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'La altura es requerida',
                    life: 3000
                });
            }
            return true;
        },
        validateAllergies(silent = false) {
            //It must have an allergy or be marked as no allergies
            for (const id in this.allergiesErrors) this.allergiesErrors[id] = false;
            if (this.not_allergies) return true;

            //Validate that at least one allergy if marked as allergic
            let hasAllergy = false;
            for (const {id} of this.allergiesList)
                if (this.allergies[id]) { hasAllergy = true; break; }
            if (!hasAllergy) {
                if (silent) return false;
                for (const id in this.allergiesErrors) this.allergiesErrors[id] = true;
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'Debe seleccionar al menos una alergia o marcar "Sin alergias"',
                    life: 3000
                });
                return false;
            }
            return true;
        },
        validateMedicalConditions(silent = false) {
            //It must have a medical condition or be marked as no medical conditions
            for (const id in this.medicalConditionsErrors) this.medicalConditionsErrors[id] = false;
            if (this.notMedicalConditions) return true;

            //Validate that at least one medical condition if marked as having medical conditions
            let hasMedicalCondition = false;
            for (const {id} of this.medicalConditionsList)
                if (this.medicalConditions[id]) { hasMedicalCondition = true; break; }
            if (!hasMedicalCondition) {
                if (silent) return false;
                for (const id in this.medicalConditionsErrors) this.medicalConditionsErrors[id] = true;
                this.$toast.add({
                    severity: 'warn',
                    summary: 'Error al registrar',
                    detail: 'Debe seleccionar al menos una condición médica o marcar "Sin condiciones médicas"',
                    life: 3000
                });
                return false;
            }

            return true;
        },

        goToAllergies() {
            if (!this.validatePatientFields()) return;
            this.stage = 1;
        },
        goToMedicalConditions() {
            if (!this.validateAllergies()) return;
            this.stage = 2;
        },

        async register() {
            if (!this.validatePatientFields()) return;
            if (!this.validateAllergies()) return;
            if (!this.validateMedicalConditions()) return;

            try {
                this.processing = true;
                let {response: patient, error: patientError} = await register(this.patient)
                if (patientError) {
                    this.stage = 0

                    for (const key in this.patientErrors) this.patientErrors[key] = true;

                    return this.$toast.add({
                        severity: 'warn',
                        summary: 'Error al registrar el paciente',
                        detail: patientError,
                        life: 3000
                    });
                }
                localStorage.setItem('authToken', patient.token);

                for(const allergyId in this.allergies)
                    await linkAllergiesToPatient(patient.id, allergyId)
                for(const conditionId in this.medicalConditions)
                    await linkConditionsToPatient(patient.id, conditionId)
                if(this.doctor) await linkPatientToDoctor(patient.id, this.doctor.id)

                localStorage.removeItem('create_patient');
                localStorage.removeItem('create_allergies');
                localStorage.removeItem('create_not_allergies');
                localStorage.removeItem('createMedicalConditions');
                localStorage.removeItem('create_notMedicalConditions');

                if(!this.doctor) this.login(patient)
                else this.$emit('patientSelector', {})
            }
            catch (e) { console.log(e) }
            finally { this.processing = false; }
        },
        back (){ this.$emit('back') }
    },
    created() {
        const savedAllergiesList = localStorage.getItem('allergies_list');
        if (savedAllergiesList) this.allergiesList = JSON.parse(savedAllergiesList);
        else this.loadAllergiesList()

        const savedMedicalConditionsList = localStorage.getItem('medicalConditions_list');
        if (savedMedicalConditionsList) this.medicalConditionsList = JSON.parse(savedMedicalConditionsList);
        else this.loadMedicalConditionsList()

        const savedPatient = localStorage.getItem('create_patient');
        if (savedPatient) this.patient = JSON.parse(savedPatient);
        this.patient.birthdate = this.patient.birthdate ? new Date(this.patient.birthdate) : null;

        if (savedPatient && this.validatePatientFields(true)) this.stage = 1;
        else return;

        const savedAllergies = localStorage.getItem('create_allergies');
        if (savedAllergies) this.allergies = JSON.parse(savedAllergies);
        const savedNotAllergies = localStorage.getItem('create_not_allergies');
        if (savedNotAllergies) this.not_allergies = JSON.parse(savedNotAllergies);

        if (savedAllergies && this.validateAllergies(true)) this.stage = 2;
        else return;

        const savedMedicalConditions = localStorage.getItem('createMedicalConditions');
        if (savedMedicalConditions) this.medicalConditions = JSON.parse(savedMedicalConditions);
        const savedNotMedicalConditions = localStorage.getItem('create_notMedicalConditions');
        if (savedNotMedicalConditions) this.notMedicalConditions = JSON.parse(savedNotMedicalConditions);

        if(Array.isArray(this.medicalConditions_extra)) this.medicalConditions_extra = {}
        console.log('Restored data from localStorage', this.patient, this.patient);
    },
    watch: {
        patient: {
            handler(newValue) {
                for (const key in this.patientErrors) this.patientErrors[key] = false;
                localStorage.setItem('create_patient', JSON.stringify(newValue));
            },
            deep: true
        },

        allergies: {
            handler() {
                if (this.internalProcessing) return
                for (const key in this.allergiesErrors) this.allergiesErrors[key] = false;
                this.saveAllergies();
            },
            deep: true
        },
        not_allergies() {
            this.startInternalProcessing();
            this.allergies = {}
            this.allergiesErrors = {}
            this.allergies_extra = []
            this.saveAllergies();
            this.stopInternalProcessing();
        },


        medicalConditions: {
            handler() {
                if (this.internalProcessing) return
                for (const key in this.medicalConditionsErrors)
                    this.medicalConditionsErrors[key] = false;
                this.saveMedicalConditions();
            },
            deep: true
        },
        notMedicalConditions() {
            this.startInternalProcessing();
            this.medicalConditions = {}
            this.medicalConditionsErrors = {}
            this.medicalConditions_extra = []
            this.saveMedicalConditions();
            this.stopInternalProcessing();
        },
    }
}
</script>

<template>
    <div id="login" v-if="allergiesList && medicalConditionsList">
        <div class="flex col center margin-top-3" v-motion-slide-bottom :duration="1000">
            <h1 class="white font-36px text-shadow">Regístrate</h1>
        </div>


        <div class="flex col center gap-1 margin-bottom-4" v-if="stage === 0">
            <div class="white font-19px text-shadow" v-motion-slide-bottom
                 :duration="1000" :delay="200">Datos del paciente</div>
            <div class="flex col center gap-0-5">
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="400">
                    <InputText v-model="patient.dniCe" placeholder="DNI o CE" maxlength="20"
                               :invalid="patientErrors.dniCe" id="dniCe" class="white"/>
                    <div class="max-width red font-12px text-center" v-if="isString(patientErrors.dniCe)"
                         v-html="patientErrors.dniCe"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="450">
                    <InputText v-model="patient.name" placeholder="Nombres" maxlength="100"
                               :invalid="patientErrors.name" id="name" class="white"/>
                    <div class="max-width red font-12px text-center" v-if="isString(patientErrors.name)"
                         v-html="patientErrors.name"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="500">
                    <InputText v-model="patient.lastname" placeholder="Apellidos" maxlength="100"
                               :invalid="patientErrors.lastname" id="lastname" class="white"/>
                    <div class="max-width red font-12px text-center" v-if="isString(patientErrors.lastname)"
                         v-html="patientErrors.lastname"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="550">
                    <Calendar v-model="patient.birthdate" placeholder="Fecha de Nacimiento" class="white"
                              :invalid="patientErrors.birthdate" id="birthdate" :max-date="new Date()"/>
                    <div class="red font-12px text-center" v-if="isString(patientErrors.birthdate)"
                         v-html="patientErrors.birthdate"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="600">
                    <Select id="sex" placeholder="Sexo" :invalid="patientErrors.sex" class="white"
                            v-model="patient.sex" :options="sexes" optionLabel="label" optionValue="value"/>
                    <div class="red font-12px text-center" v-if="isString(patientErrors.sex)"
                         v-html="patientErrors.sex"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="650">
                    <InputText v-model="patient.phone" placeholder="Teléfono" v-keyfilter="/^[0-9\-+\s]+$/"
                               :invalid="patientErrors.phone" id="phone" maxlength="30" class="white"/>
                    <div class="max-width red font-12px text-center" v-if="isString(patientErrors.phone)"
                         v-html="patientErrors.phone"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="700">
                    <InputText v-model="patient.email" placeholder="Correo electrónico"
                               v-keyfilter="/^[^\s]+$/"class="white"
                               :invalid="patientErrors.email" id="email" maxlength="100" />
                    <div class="max-width red font-12px text-center" v-if="isString(patientErrors.email)"
                         v-html="patientErrors.email"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="750">
                    <InputText v-model="patient.username" placeholder="Usuario" maxlength="100"
                               :invalid="patientErrors.username" id="username" class="white"
                               v-keyfilter="/^[0-9a-zA-ZñÑáéíóúÁÉÍÓÚ_-]+$/"/>
                    <div class="max-width red font-12px text-center"
                         v-if="isString(patientErrors.username)"
                         v-html="patientErrors.username"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="800">
                    <Password v-model="patient.password" placeholder="Contraseña" toggleMask class="white"
                              :invalid="patientErrors.password" :feedback="false" id="password"/>
                    <div class="red font-12px text-center" v-if="isString(patientErrors.password)"
                         v-html="patientErrors.password"/>
                </div>
                <div class="flex col center" v-motion-slide-bottom :duration="1000" :delay="850">
                    <Password v-model="patient.repeatPassword" placeholder="Repite la Contraseña"
                              toggleMask :invalid="patientErrors.repeatPassword" :feedback="false"
                              id="repeatPassword" class="white"/>
                    <div class="red font-12px text-center" v-if="isString(patientErrors.repeatPassword)"
                         v-html="patientErrors.repeatPassword"/>
                </div>
            </div>
            <div class="white font-19px text-shadow"
                 v-motion-slide-bottom :duration="1000" :delay="1000">Datos Antropométricos</div>
            <div class="flex col center gap-0-5">
                <div class="flex col center" v-for="(av, index) in anthropometricValues" :key="av.key"
                     v-motion-slide-bottom :duration="1000" :delay="1000 + index * 50">
                    <InputNumber mode="decimal" :id="av.key" v-model.number="patient[av.key]"
                                 :placeholder="av.label" :invalid="patientErrors[av.key]"
                                 minFractionDigits="2" :useGrouping="false"
                                 :min="av.min" :max="av.max" :showButtons="true"
                                 :step="av.step" class="white"
                    />
                    <div class="text-center red font-12px" v-if="isString(patientErrors[av.key])"
                         v-html="patientErrors[av.key]"/>
                </div>
            </div>
            
            <div class="white flex col center text-button" @click="$emit('login')" v-if="!doctor"
                 v-motion-slide-bottom :duration="1000" :delay="1400">
                ¿Ya tienes una cuenta?
            </div>
            <div class="flex row gap-0-5"  v-motion-slide-bottom :duration="1000" :delay="1600">
                <Button class="box-shadow login-button" @click="back" :disabled="processing"
                        severity="secondary">
                    Volver
                </Button>
                <Button class="box-shadow login-button" @click="goToAllergies" :disabled="processing">
                    Continuar
                </Button>
            </div>
        </div>



        <div class="flex col center gap-1 margin-bottom-4" v-if="stage === 1">
            <div class="white font-19px text-shadow" v-motion-slide-bottom
                 :duration="1000" :delay="200">Alergias</div>
            <div class="flex col center gap-0-5">
                <div class="flex row row-center-left width-250"
                     v-motion-slide-bottom :duration="1000" :delay="400">
                    <Checkbox v-model="not_allergies" :binary="true" inputId="not_allergic"/>
                    <label for="not_allergic" class="margin-left-0-5 white">
                        Sin alergias
                    </label>
                </div>

                <div class="flex col center" v-for="(al, index) in allergiesList" :key="al.id"
                     v-motion-slide-bottom :duration="1000" :delay="400 + index * 50">
                    <div class="flex row row-center-left width-250">
                        <Checkbox :inputId="al.id" v-model="allergies[al.id]" :binary="true"
                                  :invalid="allergiesErrors[al.id]" :disabled="not_allergies"/>
                        <label :for="al.id" class="margin-left-0-5 white"
                               :class="{'red': allergiesErrors[al.id]}">
                            {{ al.name }}
                        </label>
                    </div>
                    <div class="text-center red font-12px" v-if="isString(allergiesErrors[al.id])"
                         v-html="allergiesErrors[al.id]"/>
                </div>
            </div>


            <div class="flex row gap-0-5"
                 v-motion-slide-bottom :duration="1000" :delay="600 + allergiesList.length * 50">
                <Button class="box-shadow login-button margin-right-1" severity="secondary"
                        @click="stage = 0" :disabled="processing">
                    Volver
                </Button>
                <Button class="box-shadow login-button"
                        @click="goToMedicalConditions" :disabled="processing">
                    Continuar
                </Button>
            </div>
        </div>


        <div class="flex col center gap-1 margin-bottom-4" v-if="stage === 2">

            <div class="white font-19px text-shadow" v-motion-slide-bottom :duration="1000">
                Condiciones Médicas
            </div>
            <div class="flex col center gap-0-5">
                <div class="flex row row-center-left width-250"
                     v-motion-slide-bottom :duration="1000" :delay="200">
                    <Checkbox v-model="notMedicalConditions" :binary="true" inputId="not_allergic"/>
                    <label for="not_allergic" class="margin-left-0-5 white">
                        Sin condiciones médicas
                    </label>
                </div>


                <div class="flex col center" v-for="(mc, index) in medicalConditionsList" :key="mc.id"
                     v-motion-slide-bottom :duration="1000" :delay="200 + index * 50">
                    <div class="flex row row-center-left width-250">
                        <Checkbox :inputId="mc.id" v-model="medicalConditions[mc.id]" :binary="true"
                                  :invalid="medicalConditionsErrors[mc.id]"
                                  :disabled="notMedicalConditions"/>
                        <label :for="mc.id" class="margin-left-0-5 white"
                               :class="{'red': medicalConditionsErrors[mc.id]}">
                            {{ mc.name }}
                        </label>
                    </div>
                    <div class="text-center red font-12px"
                         v-if="typeof medicalConditionsErrors[mc.id] === 'string'"
                         v-html="medicalConditionsErrors[mc.id]"/>
                </div>
            </div>

            <div class="flex row" v-motion-slide-bottom :duration="1000"
                 :delay="600 + medicalConditionsList.length * 50">
                <Button class="box-shadow login-button margin-right-1" severity="secondary"
                        @click="stage = 1" :disabled="processing">
                    Volver
                </Button>
                <Button class="box-shadow login-button"
                        @click="register" :disabled="processing">
                    {{this.doctor ? 'Crear' : 'Registrarme'}}
                </Button>
            </div>
        </div>
        <poweredByGpt color="white"/>
    </div>

    <loading v-else/>

</template>

<style scoped>
/*Define an animation*/
.text-shadow {
    text-shadow: 4px 4px 4px rgba(0, 0, 0, 0.25);
}

.box-shadow {
    box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.25);
}

.login-button {
    width: 8rem;
}

/* create an style that aplies the animation */
.fade-in {
    animation: fadeIn 1s;
}

.white,
.white *,
.white input {
    color: white!important;
}
</style>