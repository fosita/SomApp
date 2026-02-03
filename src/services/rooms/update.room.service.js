import axios from "@/shared/axios/requester.service.js";
import Response from "@/shared/data/response.class.js";
import {HttpStatusCode} from "axios";

export default async function updateRoomService(doctorId, room) {
    try {
        const response = await axios.put(`doctors/${doctorId}/rooms/${room.id}`, room);
        return new Response(response.data, null, HttpStatusCode.Ok);
    } catch (error) {
        const statusCode = error.response?.status ?? HttpStatusCode.InternalServerError;
        let message = error.response?.data?.error;
        if (!message) switch (statusCode) {
            case HttpStatusCode.BadRequest:
                message = "Datos inválidos enviados en la solicitud de creacion del consultorio";
                break;
            case HttpStatusCode.Unauthorized:
                message = "El token es inválido o ha expirado";
                break;
            case HttpStatusCode.InternalServerError:
                message = "Error interno del servidor al crear el consultorio";
                break;
            default:
                message = "No se pudo establecer comunicación con el servidor";
        } return new Response(null, message, statusCode);
    }
}