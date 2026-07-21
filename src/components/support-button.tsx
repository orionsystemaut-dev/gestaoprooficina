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
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const email = settings?.support_email || "thedinjoaopedro@gmail.com";
  const phone = settings?.support_phone || "5522999211638";

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="icon" className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300" title="Fale Conosco">
            <HelpCircle className="h-6 w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-4 shadow-xl">
          <div className="mb-3 font-semibold text-sm">Central de Suporte</div>
          <p className="text-xs text-muted-foreground mb-4">
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
              onClick={() => window.location.href = `mailto:${email}`}
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
