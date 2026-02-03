import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

import { MotionPlugin } from '@vueuse/motion'
import {
    InputNumber, InputText, Textarea, Password, InputOtp,
    InputGroup, InputGroupAddon, DatePicker, FloatLabel,
    Select, MultiSelect, Checkbox, Button, Divider,
    DataTable, Column, Row,
    Dialog, Card, ProgressSpinner, Avatar, KeyFilter,
    ConfirmationService, ConfirmDialog,
    ToastService, Toast, Tooltip
} from "primevue";
import loadingComponent from "@/components/loading.component.vue";
import indexStyle from "@/shared/styles/index.style.js";

import 'primeicons/primeicons.css'

import PrimeVue from 'primevue/config';
import Aura from './shared/primevue/drBeatTheme.js'
import Chart from "primevue/chart";

const app = createApp(App);
app.use(router)
app.use(PrimeVue, {
    theme: { preset: Aura },
    locale: {
        firstDayOfWeek: 1,
        dayNames: ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'],
        dayNamesShort: ['dom','lun','mar','mié','jue','vie','sáb'],
        dayNamesMin: ['D','L','M','M','J','V','S'],
        monthNames: [
            'enero','febrero','marzo','abril','mayo','junio',
            'julio','agosto','septiembre','octubre','noviembre','diciembre'
        ],
        monthNamesShort: [
            'ene','feb','mar','abr','may','jun',
            'jul','ago','sep','oct','nov','dic'
        ],
        today: 'Hoy',
        clear: 'Limpiar',
        dateFormat: 'dd/mm/yy',
    }
});
app.use(ToastService)
app.use(ConfirmationService)
app.use(MotionPlugin)

app.directive('keyfilter', KeyFilter);
app.directive('tooltip', Tooltip);

app.component('InputText', InputText)
app.component('InputNumber', InputNumber)
app.component('Textarea', Textarea)
app.component('Password', Password)
app.component('Calendar', DatePicker)
app.component('InputOtp', InputOtp)

app.component("InputGroup",InputGroup)
app.component("InputGroupAddon", InputGroupAddon)
app.component("FloatLabel", FloatLabel)

app.component('Select', Select)
app.component('Dropdown', Select)
app.component('MultiSelect', MultiSelect)

app.component('Card', Card)
app.component("Button", Button)
app.component("Checkbox", Checkbox)
app.component('Avatar', Avatar)
app.component("ProgressSpinner", ProgressSpinner)

app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Row', Row)
app.component('Divider', Divider)
app.component('Toast', Toast)
app.component('Loading', loadingComponent)
app.component('EmojiPicker', EmojiPicker)
app.component('Dialog', Dialog)
app.component('Select', Select)

app.component('ConfirmDialog', ConfirmDialog)

app.component('Chart', Chart)

app.mount('#app')
