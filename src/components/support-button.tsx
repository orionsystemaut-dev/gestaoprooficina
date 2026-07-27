import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MessageCircle, Mail, HelpCircle } from "lucide-react";

export function SupportButton() {
  const [open, setOpen] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("system_settings" as any).select("key, value");
      if (error) throw error;
      return (data || []).reduce((acc: any, row: any) => {
        acc[row.key] = typeof row.value === 'string' ? row.value.replace(/^"|"$/g, '') : row.value;
        return acc;
      }, {});
    },
    staleTime: 1000 * 60 * 5,
  });

  const email = settings?.support_email || "thedinjoaopedro@gmail.com";
  const phone = settings?.support_phone || "5522999211638";

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-40 sm:bottom-4 sm:right-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="outline"
            aria-label="Fale conosco"
            title="Fale conosco"
            className="pointer-events-auto h-9 w-9 rounded-full border-border/60 bg-background/70 text-muted-foreground shadow-sm backdrop-blur-md opacity-60 transition-all duration-200 hover:opacity-100 hover:text-foreground hover:shadow-md focus-visible:opacity-100"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" side="top" className="pointer-events-auto w-64 p-4 shadow-xl">
          <div className="mb-3 text-sm font-semibold">Central de Suporte</div>
          <p className="mb-4 text-xs text-muted-foreground">
            Como você prefere entrar em contato com nossa equipe?
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => window.open(`https://wa.me/${phone}`, "_blank")}
            >
              <MessageCircle className="h-4 w-4 text-green-600" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => (window.location.href = `mailto:${email}`)}
            >
              <Mail className="h-4 w-4 text-blue-600" />
              E-mail
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
