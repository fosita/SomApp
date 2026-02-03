El proyecto también posee una conexión con GPT, lo que permite generar respuestas automáticas y mejorar la interacción
con los usuarios. Esta funcionalidad puede ser utilizada para proporcionar asistencia, responder preguntas frecuentes o
incluso generar contenido dinámico basado en las necesidades del usuario. La integración con GPT se realiza a través de
una API, lo que facilita su implementación y uso dentro del proyecto. Esta integración se puede encontrar dentro del backend,
ya que de esta forma, no se expone el API KEY de OpenAI al público, en la carpeta /backend/infrastructure/openai, dentro
de open.ai.client.cjs. La función principal que maneja las solicitudes a GPT es "getGptResponse".