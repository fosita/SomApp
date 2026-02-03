import requester from "@/shared/axios/requester.service.js";
import Response  from "@/shared/data/response.class.js";
import { HttpStatusCode } from "axios";

export default async function addPatient(child) {
    try {
        const res = await requester.post(`child`, child);
        return new Response(res.data, null, HttpStatusCode.Ok);
    } catch (err) {
        const statusCode = err.response?.status ?? HttpStatusCode.InternalServerError;
        let message = err.response?.data?.error;
        if (!message) switch (statusCode) {
            case HttpStatusCode.BadRequest:
                message = "Datos del paciente inválidos";
                break;
            case HttpStatusCode.Unauthorized:
                message = "El token es inválido o ha expirado";
                break;
            case HttpStatusCode.InternalServerError:
                message = "Error interno al crear el paciente";
                break;
            default:
                message = "No se pudo conectar con el servidor";
        } return new Response(null, message, statusCode);
    }
}