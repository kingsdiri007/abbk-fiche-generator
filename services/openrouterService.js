import { OpenRouter } from "@openrouter/sdk";

const client = new OpenRouter({
  apiKey: import.meta.env.REACT_OPENROUTER_API_KEY, // Store the API key in .env
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000/",
    "X-Title": "ABBK PhysicsWorks App",
  },
});

export async function textTranslate(text, targetLang) {
  try {
    const completion = await client.chat.send({
      model: "deepseek/deepseek-r1-0528:free", 
      messages: [
        {
          role: "user",
          content: `Translate this text to ${targetLang}: ${text}`
        }
      ]
    });

    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenRouter error:", err);
    return text; // fallback
  }
}
