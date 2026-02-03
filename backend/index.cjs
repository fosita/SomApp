// ===============================
//  MAIN SERVER
// ===============================
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');
const userRoutes = require('./interfaces/routes/router.cjs');
require('dotenv').config({ path: './backend/.env' });

const PORT = JSON.parse(process.env.PORT || '3016');
const URL = process.env.URL || 'somapp.tarket.com.pe';
const logger = require('./shared/utils/logger.util.cjs');

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'UPDATE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ======================================
//  REDIRECCIÓN DESDE "/" → "/api-docs"
// ======================================
app.get('/', (req, res) => {
    res.redirect('/api-docs');
});

// ======================================
//  SWAGGER UI (Documentación)
// ======================================
const swaggerDocument = fs.readFileSync('./backend/docs/swagger.json', 'utf8');
const parsedDoc = JSON.parse(swaggerDocument);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(parsedDoc, { explorer: true }));

// ======================================
//  RUTAS PRINCIPALES DE API
// ======================================
app.use('/api/v1', userRoutes);

// ======================================
//  SERVIDOR HTTPS (si existe certificado)
// ======================================
try {
    const server = https.createServer({
        key: fs.readFileSync(`C:/Certbot/live/${URL}/privkey.pem`),
        cert: fs.readFileSync(`C:/Certbot/live/${URL}/fullchain.pem`)
    }, app);

    server.listen(PORT, () => {
        logger.log(`🔐 Servidor HTTPS funcionando en https://${URL}:${PORT}`);
        logger.log(`📘 Swagger disponible en https://${URL}:${PORT}/api-docs`);
    });

} catch {

    // ============================
    //  SERVIDOR HTTP DE RESPALDO
    // ============================
    app.listen(PORT, () => {
        logger.log(`⚠️ No se encontró certificado SSL. Ejecutando HTTP.`);
        logger.log(`🌐 Servidor HTTP:  http://localhost:${PORT}`);
        logger.log(`📘 Swagger:        http://localhost:${PORT}/api-docs`);
    });

}