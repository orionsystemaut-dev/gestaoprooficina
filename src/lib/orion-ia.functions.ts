import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
});

const SYSTEM_PROMPT =
  "Você é a Órion-IA, uma assistente virtual inteligente e prestativa do sistema de gestão OficinaPro (gestão de oficinas mecânicas: ordens de serviço, clientes, veículos, peças, colaboradores e financeiro). Responda sempre em português brasileiro, de forma clara e objetiva.";

export const askOrionIA = createServerFn({ method: "POST" })
  .inputValidator((data) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Assistente indisponível: chave de IA não configurada.");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
      }),
    });

    if (res.status === 429) throw new Error("Muitas solicitações. Tente novamente em instantes.");
    if (res.status === 402) throw new Error("Créditos de IA insuficientes.");
    if (!res.ok) {
      console.error("[Órion-IA] gateway error", res.status, await res.text());
      throw new Error("Não foi possível falar com a assistente agora.");
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return { text: json.choices?.[0]?.message?.content?.trim() || "Não consegui gerar uma resposta." };
  });
