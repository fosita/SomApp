import requester from "@/shared/axios/requester.service.js";
import Response from "@/shared/data/response.class.js";
export default async function login(credentials) {
    try {
        if(!credentials.username)
            return new Response(null, "El usuario es obligatorio");
        if(!credentials.password)
            return new Response(null, "La contraseña es obligatoria");

        const response = await requester.post('login', credentials);
        return new Response(response.data);
    } catch (error) {
        return new Response(null,
            error.response?.data?.error ? error.response.data.error:
            error.response?.status === 401 ? "Usuario o contraseña incorrectos"
            : error.response?.status === 500 ? "Error interno del servidor al iniciar sesión"
            : error.response?.status === 404 ? "Se ha deshabilitado el servicio de inicio de sesión"
            : "No se pudo establecer comunicación con el servidor"
        )
    }
}