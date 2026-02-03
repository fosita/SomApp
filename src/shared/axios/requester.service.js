import axios from "axios";
export const production = window.location.hostname !== 'localhost'
export const baseURL = production?
    'https://somapp.tarket.com.pe:3016/api/v1/':
    'http://localhost:3016/api/v1/';

const httpsRequester = axios.create({
    baseURL, timeout: 2 * 60 * 1000, headers: {'Content-Type': 'application/json'}
})

httpsRequester.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

export default httpsRequester