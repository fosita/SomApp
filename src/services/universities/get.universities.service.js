import requester from "@/shared/axios/requester.service.js";
import Response from "@/shared/data/response.class.js";
import {HttpStatusCode} from "axios";

export default async function getUniversities() {
    try {
        const response = await requester.get('/universities');
        return new Response(response.data, null, HttpStatusCode.Ok);
    } catch (error) {
        const statusCode = error.response?.status ?? HttpStatusCode.InternalServerError;
        let message = error.response?.data?.error;
        if (!message) switch (statusCode) {
            case HttpStatusCode.Unauthorized:
                message = "El token es inválido o ha expirado";
                break;
            case HttpStatusCode.NotFound:
                message = "El sistema de universidades se encuentra temporalmente en mantenimiento";
                break;
            case HttpStatusCode.InternalServerError:
                message = "Error interno del servidor al obtener las universidades";
                break;
            default:
                message = "No se pudo establecer comunicación con el servidor";
        } return new Response(null, message, statusCode);
    }
}