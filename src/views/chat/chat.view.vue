<script>
import sendMessage from "@/services/messages/send.message.service.js";
import getGPTResponse from "@/services/messages/gpt.response.service.js";
import getPatientMessages from "@/services/messages/get.messages.service.js";
import getDoctorsPerPatient from "@/services/patients/get.doctors.per.patient.js";
import {HttpStatusCode} from "axios";

export default {
    name: "somapp.chat.view.vue",
    props: {
        doctor: Object,
        patient: Object,
        dark: {type: Boolean, default: false}
    },
    data() {
        return {
            message: "",
            lastLength: null,
            messages: null,
            emojiPicker: false,
            chatDisabled: true,
            askGPT: true,
            doctors: [],

            ticker: null,

            waiting: {
                messages: true,
                doctors: false,
                send: false,
                response: false
            }
        }
    },
    methods: {
        handleError(error, summary = null, detail = null){
            console.error(error, summary, detail);
            this.$toast.add({
                severity: 'error',
                summary: summary ?? 'Error',
                detail: error.error ?? detail ?? 'Ocurrió un error inesperado.',
                life: 5000,
            });
            if (this.ticker) { clearInterval(this.ticker); this.ticker = null; }
            if(error.statusCode === HttpStatusCode.Unauthorized)
                return this.$emit('logout')
            return this.$emit('profile')
        },
        isMine(chat) {
            return this.doctor ? chat.doctorId === this.doctor.id :
                this.patient ? chat.fromPatient : false;
        },
        async loadMessages(){
            try {
                if(this.waiting.response || this.waiting.send) return;
                const messages = await getPatientMessages(this.patient.id)
                if (messages.error) return this.handleError(messages,'Error al cargar los mensajes');
                if(!this.messages || this.messages.length !== messages.response.length)
                    this.messages = messages.response;

            } catch (e) { console.error(e) }
            finally { this.waiting.messages = false; }
        },
        async loadDoctors(){
            try {
                if(this.waiting.doctors) return;
                this.waiting.doctors = true
                const res = await getDoctorsPerPatient(this.patient.id);
                if(res.error) return this.handleError(res,'Error al cargar los doctores');
                this.doctors = res.response;
            } catch (e) { console.error(e); }
            finally { this.waiting.doctors = false; }
        },
        async sendMessage() {
            if (this.message) {
                this.waiting.send = true;
                try {
                    this.waiting.send = this.message;
                    this.message = "";
                    const response = await sendMessage(
                        this.patient.id,
                        this.doctor?this.doctor.id:null,
                        this.waiting.send
                    );
                    if(response.error) {
                        this.waiting.send = false;
                        return this.messages.push({
                            patientId: this.patient.id,
                            doctorId: this.doctor?this.doctor.id:null,
                            content: response.error,
                            fromPatient: !!this.doctor,
                        });
                    }
                    this.waiting.send = false;
                    this.messages.push(response.response)

                    if(this.doctor || !this.askGPT) return
                    this.waiting.response = true;

                    const botResponse = await getGPTResponse(this.patient.id);

                    if (botResponse.response) this.messages.push(botResponse.response)
                } catch (e) {
                    return this.messages.push({
                        patientId: this.patient.id,
                        doctorId: this.doctor?this.doctor.id:null,
                        text: "Hubo un error con la red, por favor intenta de nuevo",
                        fromPatient: !!this.doctor,
                        createdAt: Date.now()
                    });
                } finally { this.waiting.response = false; this.waiting.send = false; }
            }
        },
        parseMarkdownToHTML(markdownText) {
            if (!markdownText) return '';
            return markdownText
                // **negrita**
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                // *cursiva*
                .replace(/\*(.*?)\*/g, '<i>$1</i>')
                // Saltos de línea
                .replace(/\n/g, '<br>');
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const container = this.$refs.bubblesContainer;
                if (container) { container.scrollTop = container.scrollHeight; }
            });
        },
        toggleEmojiPicker() { this.emojiPicker = !this.emojiPicker },
        focusElement(id) {
            this.$nextTick(() => {
                const element = document.getElementById(id);
                if (!element) return;
                if (element.tagName === 'INPUT') { element.focus(); element.select(); }
                else {
                    const input = element.querySelector('input');
                    if (input) { input.focus(); input.select(); }
                    else { element.focus(); }
                }
            });
        },
        getDoctor(id){
            const doctor = this.doctors.find(doc => doc.id === id);
            if(doctor) return `${doctor.name} ${doctor.lastname}`
            this.loadDoctors()
            return "Desconocido";
        },

        askForCurrentStatus(){
            this.message = "Me gustaría saber el estado en el que me encuentro, " +
                "y que posibilidades tengo de recaer en el cancer de mama.";
            this.sendMessage();
        },
        askForAdvice(){
            this.message = "¿Podrías darme algunos consejos para evitar que recaiga en el cancer?";
            this.sendMessage();
        },
        askForAddInformation(){
            this.message = "Deberías saber esto sobre mi: ";
            this.focusElement('message');
        }
    },
    watch: {
        messages: {
            handler() {
                if(this.lastLength !== this.messages.length){
                    this.lastLength = this.messages.length;
                    this.scrollToBottom();
                }
            }, deep: true
        },
        waiting: { handler() { this.scrollToBottom() }, deep: true }
    },
    async created() {
        if (!this.patient) { this.$emit('login'); return this.$emit('logout') }
        await this.loadDoctors()
        await this.loadMessages()
        //create a ticker that loads messages every 10 seconds
        this.ticker = setInterval(async () => { await this.loadMessages() }, 20 * 1000);
    },
    beforeUnmount() { clearInterval(this.ticker) },
    beforeDestroy() { clearInterval(this.ticker) }
}
</script>

<template>
    <div class="flex col col-top-center gap-0-5 bubblesContainer relative min-max-full-screen"
         ref="bubblesContainer" @click="emojiPicker = false">
        <div class="font-9px text-center margin-1" v-if="!messages || !messages.length">
            La información brindada por la IA de SomApp es generada por una versión reentrenada
            del modelo GPT4 para resolver consultas nutricionales. La información brindada podría
            no ser 100% precisa.
        </div>
        <div v-for="chat in messages" class="max-width flex row gap-0-5" v-if="messages && messages.length">
            <div class="size-30" v-if="!isMine(chat)">
                <img src="/doctor.svg" v-if="chat.doctorId" alt="DOC" class="size-30"/>
                <img src="/patient.svg" v-if="chat.fromPatient" alt="PAC" class="size-30"/>
                <img :src="dark?'/chatgpt.light.svg':'/chatgpt.dark.svg'"
                     v-if="!chat.fromPatient && !chat.doctorId" alt="GPT" class="size-30"/>
            </div>

            <div v-if="!isMine(chat)" class="bubble-right text-justify">
                <div class="font-10px secondary-text">
                    {{ chat.doctorId ? getDoctor(chat.doctorId) :
                    chat.fromPatient ? patient.name + ' ' + patient.lastname : 'SomApp Chat Bot' }}
                </div>
                <div v-html="parseMarkdownToHTML(chat.text)"/>
                <div class="font-10px">{{ new Date(chat.createdAt).toLocaleString('es-PE',
                    { day: '2-digit', month: '2-digit', year: 'numeric'}) }}</div>
            </div>
            <div v-else class="bubble-left text-justify">
                <div class="text-justify font-14px" v-html="parseMarkdownToHTML(chat.text)"/>
                <div class="self-align-right font-10px">{{ new Date(chat.createdAt).toLocaleString('es-PE',
                    { day: '2-digit', month: '2-digit', year: 'numeric'}) }}</div>
            </div>
            <!--<img :src="user.photo" alt="user" v-if="chat.role === 'user'" class="size-30"/>-->
        </div>
        <div v-else-if="messages" class="margin-top-auto flex col center">
            <div class="flex row center gap-0-1">
                <h1 class="font-32px">SomApp Chat</h1>
                <svg width="40" height="40" viewBox="1 1 27 23" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.2352 0.356357C10.6184 0.356357 8.29367 2.03878 7.48351 4.52343L7.19144 6.22964V11.8849C7.19144 12.1677 7.33682 12.4188 7.57999 12.5642L12.133 15.1878V7.41646H12.1343V7.04773L16.7428 4.38598C17.1884 4.128 17.6737 3.95174 18.1764 3.85961L17.7327 2.35465C16.5882 1.07532 14.9507 0.348427 13.2352 0.356357ZM13.2352 1.90926L13.2273 1.91719C14.2806 1.91719 15.293 2.28064 16.1031 2.95334C16.0701 2.9692 16.0053 3.01017 15.9578 3.03396L11.1933 5.77765C10.9501 5.9151 10.8048 6.17414 10.8048 6.45696V12.8972L8.75492 11.7157V6.3922C8.75359 3.91946 10.7585 1.91323 13.2352 1.90926Z" fill="var(--primary)"/>
                    <path d="M24.2133 5.2341C22.9049 2.96788 20.2855 1.79581 17.7286 2.33652L16.105 2.93668L11.2074 5.76429C10.9625 5.9057 10.8177 6.15716 10.8134 6.44044L10.8178 11.6953L17.5479 7.80959L17.5486 7.81073L17.8679 7.62637L22.4773 10.2866C22.9235 10.5435 23.3188 10.8757 23.6499 11.2649L24.7314 10.1282C25.2671 8.49732 25.0779 6.71577 24.2133 5.2341ZM22.8684 6.01055L22.8576 6.00765C23.3842 6.91985 23.5757 7.97831 23.3982 9.01628C23.3679 8.9956 23.3001 8.96 23.2557 8.93069L18.4973 6.1764C18.2567 6.03453 17.9597 6.03814 17.7148 6.17956L12.1373 9.39969L12.1356 7.03371L16.7459 4.37197C18.8867 3.13445 21.6266 3.86764 22.8684 6.01055Z" fill="var(--primary)"/>
                    <path d="M25.4781 17.1802C26.7865 14.914 26.4918 12.0595 24.7451 10.1156L23.4135 9.00952L18.516 6.18191C18.271 6.0405 17.9809 6.04084 17.7334 6.17875L13.1848 8.80995L19.9149 12.6956L19.9143 12.6968L20.2336 12.8811L20.2345 18.2031C20.2351 18.718 20.1451 19.2264 19.9736 19.7078L21.4987 20.076C23.1789 19.7245 24.6272 18.6698 25.4781 17.1802ZM24.1332 16.4038L24.1303 16.3929C23.6036 17.3051 22.7827 18.0002 21.795 18.3654C21.7978 18.3289 21.7947 18.2523 21.7979 18.1992L21.804 12.7012C21.8066 12.4219 21.6549 12.1665 21.41 12.0251L15.8326 8.80495L17.8807 7.62051L22.491 10.2823C24.6331 11.5175 25.3681 14.2569 24.1332 16.4038Z" fill="var(--primary)"/>
                    <path d="M15.7648 24.2487C18.3816 24.2487 20.7063 22.5662 21.5165 20.0816L21.8086 18.3754V12.7201C21.8086 12.4373 21.6632 12.1862 21.42 12.0408L16.867 9.41721V17.1885H16.8657V17.5573L12.2572 20.219C11.8116 20.477 11.3263 20.6533 10.8236 20.7454L11.2673 22.2504C12.4118 23.5297 14.0493 24.2566 15.7648 24.2487ZM15.7648 22.6957L15.7727 22.6878C14.7194 22.6878 13.707 22.3244 12.8969 21.6517C12.9299 21.6358 12.9947 21.5948 13.0422 21.571L17.8067 18.8274C18.0499 18.6899 18.1952 18.4309 18.1952 18.148V11.7078L20.2451 12.8893V18.2128C20.2464 20.6855 18.2415 22.6918 15.7648 22.6957Z" fill="var(--primary)"/>
                    <path d="M4.78673 19.3709C6.09513 21.6371 8.71453 22.8092 11.2714 22.2685L12.895 21.6683L17.7926 18.8407C18.0375 18.6993 18.1823 18.4479 18.1866 18.1646L18.1822 12.9098L11.4521 16.7954L11.4514 16.7943L11.1321 16.9786L6.5227 14.3184C6.07649 14.0615 5.68115 13.7293 5.35006 13.3401L4.26856 14.4768C3.73289 16.1077 3.92213 17.8892 4.78673 19.3709ZM6.13159 18.5945L6.14242 18.5974C5.61576 17.6852 5.42432 16.6267 5.60183 15.5887C5.63208 15.6094 5.69994 15.645 5.74433 15.6743L10.5027 18.4286C10.7433 18.5705 11.0403 18.5669 11.2852 18.4255L16.8627 15.2053L16.8644 17.5713L12.2541 20.233C10.1133 21.4706 7.37337 20.7374 6.13159 18.5945Z" fill="var(--primary)"/>
                    <path d="M3.52194 7.42478C2.21355 9.69099 2.50819 12.5455 4.25489 14.4894L5.58647 15.5955L10.484 18.4231C10.729 18.5645 11.0191 18.5642 11.2666 18.4263L15.8152 15.7951L9.08506 11.9094L9.08572 11.9083L8.76639 11.7239L8.76549 6.40194C8.76487 5.88706 8.8549 5.37859 9.02642 4.89725L7.50126 4.529C5.82106 4.88052 4.37281 5.93518 3.52194 7.42478ZM4.8668 8.20123L4.8697 8.21207C5.39636 7.29987 6.2173 6.60484 7.20496 6.23958C7.20218 6.27613 7.20528 6.3527 7.20209 6.40579L7.19597 11.9038C7.19341 12.1831 7.34506 12.4385 7.58999 12.5799L13.1674 15.8001L11.1193 16.9845L6.50899 14.3228C4.36687 13.0875 3.63188 10.3481 4.8668 8.20123Z" fill="var(--primary)"/>
                </svg>
            </div>
            ¿Con que puedo ayudarte?
        </div>
        <loading message="Cargando mensajes..." v-else class="margin-auto"/>

        <div v-if="waiting.send" class="max-width flex row gap-0-5 translucent">
            <div class="bubble-left text-justify">
                {{ this.waiting.send }}
            </div>
        </div>
        <div v-if="waiting.response" class="max-width flex row gap-0-5">
            <img :src="dark?'/chatgpt.light.svg':'/chatgpt.dark.svg'" alt="chatGPT" class="size-30"/>
            <div class="bubble-right text-left"><i class="pi pi-spin pi-spinner"/></div>
        </div>
        <div class="flex optional-col gap-0-5 max-width center margin-top-auto"
             v-if="messages && !doctor">
            <div class="flex optional-row gap-0-5 max-width max-height">
                <Button outlined fluid severity="secondary" @click="askForCurrentStatus"
                        :disabled="waiting.response || waiting.send" class="max-height">
                    <div class="font-12px">
                        Consultar mi estado actual
                    </div>
                </Button>
                <Button outlined fluid severity="secondary" @click="askForAdvice"
                        :disabled="waiting.response || waiting.send" class="max-height">
                    <div class="font-12px">
                        Consejos para evitar recaídas
                    </div>
                </Button>
            </div>
            <div class="flex optional-row gap-0-5 max-width max-height">
                <Button outlined fluid severity="secondary" @click="askForAddInformation"
                        :disabled="waiting.send || waiting.response" class="max-height">
                    <div class="font-12px">
                        Guardar datos adicionales
                    </div>
                </Button>
                <Button outlined fluid severity="secondary" @click="$emit('profile')"
                        :disabled="waiting.send || waiting.response" class="max-height">
                    <div class="font-12px">
                        Volver al perfil de Usuario
                    </div>
                </Button>
            </div>
        </div>
        <div v-else-if="messages && doctor" class="transparent margin-top-auto">.</div>
        <div class="size-3 margin-top-2-5 transparent">.</div>
    </div>
    <EmojiPicker class="absolute margin-width-1 z-10 left-0 bottom-3-8" :native="true"
                 :theme="dark?'dark':'light'" :style="{display: emojiPicker?'flex':'none'}"
                 @select="(emoji) => message += emoji.i"/>
    <div class="margin-top-auto max-width absolute bottom-0 flex col col-top-left">

        <InputGroup class="margin-1 not-width-restrictions relative z-10" style="width: calc(100% - 3rem)!important;">
            <InputGroupAddon @click="toggleEmojiPicker">
                <i class="pi pi-face-smile"/>
            </InputGroupAddon>
            <InputText class="send-input" v-model="message" placeholder="Escribe tu mensaje" id="message"
                       style="width: 100%" @keyup.enter="sendMessage" :disabled="waitingResponse"/>
            <InputGroupAddon @click="sendMessage">
                <i class="pi pi-send"/>
            </InputGroupAddon>
        </InputGroup>
    </div>

    <div class="absolute top-0-5 left-0-5">
        <Button icon="pi pi-chevron-left" @click="$emit('profile')" severity="secondary" rounded/>
    </div>

</template>

<style scoped>
.self-align-right{ align-self: end; }

@keyframes translucent {
    0% { opacity:60%; }
    50% { opacity:30% }
    100% { opacity:60%}
}

.translucent { animation: translucent 2s infinite;}

.bubblesContainer {
    width: calc(100%);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: calc(100vh - 4rem);
    overflow: auto;
}

.bubble-left, .bubble-right {
    font-size: 0.8em;
    display: flex;
    flex-direction: column;
    padding: 0.5rem;
    border-radius: 0.5rem;
    align-items: flex-start;

    width: max-content;
}

.bubble-left {
    color: white;
    background-color: #0075FF;
    margin-left: auto;
    align-self: flex-end;
    max-width: 82%;
}

.bubble-right {
    background-color: #DADADA;
    margin-right: auto;
    align-self: flex-start;
    max-width: 76%;
}

@media (prefers-color-scheme: dark) {
    .bubble-left {  background-color: #0075FF; }
    .bubble-right { background-color: #333; }
}

.send-input {
    width: calc(100% - 4rem) !important;
    min-width: calc(100% - 4rem) !important;
    max-width: calc(100% - 4rem) !important;
}

.z-5 { z-index: 5; }
.z-10 { z-index: 10; }

.optional-col{ flex-direction: row; }
@media (max-width: 900px) {
    .optional-col{ flex-direction: row; }
    .optional-row{ flex-direction: column; }
}
@media (max-width: 500px) {
    .optional-col{ flex-direction: column; }
    .optional-row{ flex-direction: column; }
}
</style>