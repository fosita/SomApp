import requester from "@/shared/axios/requester.service.js";
import Response from "@/shared/data/response.class.js";
import {HttpStatusCode} from "axios";
export default async function updateUser(user, form) {
    try {
        const response = await requester.post(`user/${user.id}/update`,
            {...user, ...form});
        return new Response(response.data);
    } catch (error) {
        return new Response(null,
            error.response?.data?.error ? error.response.data.error
            : error.response?.status === HttpStatusCode.Unauthorized ?
            "El token es inválido o ha expirado"
            : error.response?.status === HttpStatusCode.InternalServerError ?
            "Error interno del servidor al iniciar sesión"
            : error.response?.status === HttpStatusCode.NotFound ?
            "Se ha deshabilitado el servicio de edición de datos del usuario"
            : "No se pudo establecer comunicación con el servidor",
            error.response?.status || 500
        )
    }
}