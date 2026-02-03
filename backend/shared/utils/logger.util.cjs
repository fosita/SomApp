module.exports = class Logger {
    static log(...data) {
        const timestamp = new Date().toLocaleDateString("es-ES", {
            hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        console.log(`[${timestamp}]  LOG:`, ...data);
    }
    static error(...data) {
        const timestamp = new Date().toLocaleDateString("es-ES", {
            hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        console.error(`[${timestamp}]  ERR:`, ...data);
    }
    static warn(...data) {
        const timestamp = new Date().toLocaleDateString("es-ES", {
            hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        console.warn(`[${timestamp}] WARN:`, ...data);
    }
    static info(...data) {
        const timestamp = new Date().toLocaleDateString("es-ES", {
            hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        console.info(`[${timestamp}] INFO:`, ...data);
    }
    static sql(...data) {
        const timestamp = new Date().toLocaleDateString("es-ES", {
            hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
        });;
        console.log(`[${timestamp}]  SQL:`, ...data);
    }
};