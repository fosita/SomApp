import requester from "@/shared/axios/requester.service.js";
import Response from "@/shared/data/response.class.js";
import {HttpStatusCode} from "axios";

export default async function deleteAppointment(patientId, doctorId, appointmentId) {
    try {
        const response = await requester.delete(!doctorId
                ? `patients/${patientId}/appointments/${appointmentId}`
                : `doctors/${doctorId}/patients/${patientId}/appointments/${appointmentId}`
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
                message = "El sistema de citas se encuentra temporalmente en mantenimiento";
                break;
            case HttpStatusCode.InternalServerError:
                message = "Error interno del servidor al eliminar la notificación";
                break;
            default:
                message = "No se pudo establecer comunicación con el servidor";
        } return new Response(null, message, statusCode);
    }
}