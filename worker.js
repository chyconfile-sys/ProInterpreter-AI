
export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json; charset=utf-8"
    };

    const reply = (data, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: cors });

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    if (request.method === "GET") {
      return reply({
        ok: true,
        service: "ProInterpreter AI",
        message: "Backend is online"
      });
    }

    if (request.method !== "POST") {
      return reply({ error: "Use POST to interpret text." }, 405);
    }

    if (!env.GEMINI_API_KEY) {
      return reply({ error: "Cloudflare secret GEMINI_API_KEY is missing." }, 500);
    }

    try {
      const body = await request.json();
      const text = String(body.text || "").trim();

      if (!text) return reply({ error: "Enter text to interpret." }, 400);
      if (text.length > 5000) {
        return reply({ error: "Text must be 5,000 characters or fewer." }, 400);
      }

      const prompt = `
You are ProInterpreter AI, an English-Mandarin Chinese interpretation assistant.
Detect the source language.
Return JSON with these string fields:
languageDetected, originalText, english, chinese, pinyin, note.
For English input, translate into Simplified Chinese and provide tone-marked Mandarin Pinyin.
For Chinese input, translate into English and provide tone-marked Mandarin Pinyin.
Preserve medical terms, names, numbers, dosages, dates and negations.
Do not generate or play audio.
This is interpretation assistance, not a substitute for a qualified medical interpreter.

Input:
${text}
`;

     const models = ["gemini-3.8-flash"];
      let result;
      let lastError = "";

      for (const model of models) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": env.GEMINI_API_KEY
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
                maxOutputTokens: 1200
              }
            })
          }
        );

        if (response.ok) {
          result = await response.json();
          break;
        }

        lastError = `Model ${model} returned HTTP ${response.status}: ` +
          (await response.text()).slice(0, 500);
      }

      if (!result) {
        return reply({
          error: "Gemini request failed. Check that GEMINI_API_KEY is a Google AI Studio API key and that the API is enabled.",
          details: lastError
        }, 502);
      }

      const output = result.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("");

      if (!output) {
        return reply({ error: "Gemini returned no interpretation." }, 502);
      }

      let interpretation;
      try {
        interpretation = JSON.parse(output);
      } catch {
        return reply({ error: "Gemini returned an invalid JSON response." }, 502);
      }

      return reply({ ok: true, interpretation });
    } catch {
      return reply({ error: "Request failed. Please try again." }, 400);
    }
  }
};
