const logger = require('../utils/logger.util');
class Ticker {
    constructor(interval, task, name = 'Ticker') {
        this.interval = interval; // in milliseconds
        this.task = task; // function to execute
        this.timer = null;
        this.name = name;
    }

    start() {
        if (!this.timer) {
            this.timer = setInterval(async () => {
                try {await this.task()}
                catch (error) {logger.error(`Error al ejecutar el temporizador "${this.name}":`, error)}
            }, this.interval);
            logger.log(`Temporizador "${this.name}" iniciado, ejecutando cada ${this.interval} ms.`);
        }
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            console.log(`Temporizador "${this.name}" detenido.`);
        }
    }
}
module.exports = Ticker