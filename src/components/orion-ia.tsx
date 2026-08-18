import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bot, Loader2, Send, User } from "lucide-react";
import { askOrionIA } from "@/lib/orion-ia.functions";

type Message = { id: string; text: string; sender: "ai" | "user" };

const GREETING: Message = {
  id: "greeting",
  text: "Olá! Sou a Órion-IA, sua assistente virtual do OficinaPro. Como posso ajudar você hoje?",
  sender: "ai",
};

export function OrionIA() {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ask = useServerFn(askOrionIA);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const userText = inputValue.trim();
    if (!userText || isLoading) return;

    const history = [...messages, { id: String(Date.now()), text: userText, sender: "user" as const }];
    setMessages(history);
    setInputValue("");
    setIsLoading(true);

    try {
      const result = await ask({
        data: {
          messages: history
            .filter((m) => m.id !== "greeting")
            .map((m) => ({ role: m.sender === "user" ? ("user" as const) : ("assistant" as const), content: m.text })),
        },
      });
      setMessages((prev) => [...prev, { id: String(Date.now() + 1), text: result.text, sender: "ai" }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          text: err instanceof Error ? err.message : "Desculpe, ocorreu um erro ao me comunicar com o servidor.",
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 print:hidden">
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="secondary" className="gap-2 rounded-full shadow-lg">
            <Bot className="h-4 w-4" />
            Órion-IA
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" side="top" className="w-[min(22rem,calc(100vw-2rem))] p-0">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">Assistente Órion-IA</p>
            <p className="text-xs text-muted-foreground">Tire dúvidas sobre o sistema</p>
          </div>

          <div ref={scrollRef} className="max-h-72 space-y-3 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                {msg.sender === "ai" && <Bot className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />}
                <p
                  className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                    msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  }`}
                >
                  {msg.text}
                </p>
                {msg.sender === "user" && <User className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Pensando…
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 border-t p-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escreva sua dúvida…"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
