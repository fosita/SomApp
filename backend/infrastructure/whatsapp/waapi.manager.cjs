const logger = require('../../shared/utils/logger.util.cjs');
const axios = require('axios');

const API_SECRET = process.env.WHA_KEY;
const axiosInstance = axios.create({
    baseURL: 'https://www.wasenderapi.com/api/',
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_SECRET}`,
    },
});
module.exports = {
    async sendMessage(to, text) {
        const payload = { to, text };
        try { await axiosInstance.post('send-message', payload) }
        catch (err) { logger.error(err.response?.data || err.message) }
    }
}