import requester from "@/shared/axios/requester.service.js";
import Response from "@/shared/data/response.class.js";
import {HttpStatusCode} from "axios";
export default async function register(user) {
    try {
        const response = await requester.post('register', user);
        return new Response(response.data);
    } catch (error) {
        return new Response(null,
            error.response?.data?.error ? error.response.data.error:
            error.response?.status === HttpStatusCode.Conflict ?
                "Ya existe una cuenta con el mismo correo electrónico, DNI o usuario"
            : error.response?.status === HttpStatusCode.Unauthorized ?
                "Código de participación inválido"
            : error.response?.status === HttpStatusCode.BadRequest ?
                "Los datos enviados son inválidos"
            : error.response?.status === HttpStatusCode.InternalServerError ?
                "Error interno del servidor al registrar el usuario"
            : error.response?.status === HttpStatusCode.NotFound ?
                "Se ha deshabilitado el registro de nuevos usuarios"
            : "No se pudo establecer comunicación con el servidor"
        );
    }
}