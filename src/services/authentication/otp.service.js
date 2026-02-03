import requester from "@/shared/axios/requester.service.js";
import Response from "@/shared/data/response.class.js";
export default async function validateOtp(userId, otp) {
    try {
        if(!userId) return new Response(null, "El usuario es obligatorio");
        if(!otp) return new Response(null, "El OTP es obligatorio");
        if(otp.length !== 6) return new Response(null, "El OTP debe tener 6 dígitos");

        const response = await requester.post('login/otp', { userId, otp });
        return new Response(response.data);
    } catch (error) {
        console.error(error)
        return new Response(null,
            error.response?.data?.error ? error.response.data.error:
            error.response?.status === 401 ? "Usuario o contraseña incorrectos"
            : error.response?.status === 500 ? "Error interno del servidor al iniciar sesión"
            : error.response?.status === 404 ? "Se ha deshabilitado el servicio de inicio de sesión"
            : "No se pudo establecer comunicación con el servidor"
        )
    }
}