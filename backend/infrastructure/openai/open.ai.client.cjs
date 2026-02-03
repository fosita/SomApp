const OpenAI = require("openai");
const GPT_KEY = process.env.GPT_KEY;
const client = new OpenAI({
    apiKey: GPT_KEY,
});
module.exports = client;