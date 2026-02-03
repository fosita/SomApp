import requester from "@/shared/axios/requester.service.js";
import Response from "@/shared/data/response.class.js";
import {HttpStatusCode} from "axios";

export default async function updateAppointment(patientId, doctorId, notification) {
    try {
        const response = await requester.put(
            !doctorId
                ? `patients/${patientId}/appointments/${notification.id}`
                : `doctors/${doctorId}/patients/${patientId}/appointments/${notification.id}`,
            notification
        );
        return new Response(response.data, null, HttpStatusCode.Ok);
    } catch (error) {
        const statusCode = error.response?.status ?? HttpStatusCode.InternalServerError;
        let message = error.response?.data?.error;
        if (!message) switch (statusCode) {
            case HttpStatusCode.Unauthorized:
                message = "El token es inválido o ha expirado";
                break;
            case HttpStatusCode.NotFound:
                message = "No se pudo encontrar al paciente";
                break;
            case HttpStatusCode.InternalServerError:
                message = "Error interno del servidor al actualizar la cita";
                break;
            default:
                message = "No se pudo establecer comunicación con el servidor";
        } return new Response(null, message, statusCode);
    }
}