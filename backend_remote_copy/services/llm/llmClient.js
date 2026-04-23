

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function callLLM(messages) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages,
    }),
  });

  const data = await response.json();

  console.log("LLM RESPONSE:", JSON.stringify(data, null, 2));

  if (data.error) {
    console.error("LLM ERROR:", data.error.message);
    return "LLM error: " + data.error.message;
  }

  const content = data.choices?.[0]?.message?.content;

  if (Array.isArray(content)) {
    return content.map(c => c.text).join("");
  }

  if (typeof content === "string") {
    return content;
  }

  return "No response from model";
}

module.exports = { callLLM };