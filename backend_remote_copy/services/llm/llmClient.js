const fetch = require("node-fetch");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function callLLM(messages) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "anthropic/claude-3.5-sonnet", // luego pruebas opus
      messages,
    }),
  });


  const data = await response.json();

  console.log("LLM RESPONSE:", JSON.stringify(data, null, 2));

  return data.choices?.[0]?.message?.content || "No response from model";
}

module.exports = { callLLM };