import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveUnit } from "@/hooks/use-active-unit";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { traduzirErro } from "@/lib/errors";

export const Route = createFileRoute("/app/admin/configuracoes")({
  head: () => ({ meta: [{ title: "Admin Geral — Configurações Globais" }] }),
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { isSuperAdmin } = useActiveUnit();
  const nav = useNavigate();
  useEffect(() => { if (!isSuperAdmin) nav({ to: "/app/dashboard" }); }, [isSuperAdmin, nav]);

  const qc = useQueryClient();

  const [form, setForm] = useState({ support_email: "", support_phone: "" });

  const { isLoading } = useQuery({
    queryKey: ["admin-system-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("system_settings" as any).select("key, value");
      if (error) throw error;
      const settings = (data || []).reduce((acc: any, row: any) => {
        acc[row.key] = typeof row.value === 'string' ? row.value.replace(/^"|"$/g, '') : row.value;
        return acc;
      }, {});
      setForm({
        support_email: settings.support_email || "",
        support_phone: settings.support_phone || "",
      });
      return settings;
    },
    enabled: isSuperAdmin,
  });

  const save = useMutation({
    mutationFn: async () => {
      // Upsert email
      const { error: err1 } = await supabase.from("system_settings" as any).upsert({
        key: "support_email",
        value: form.support_email,
      });
      if (err1) throw err1;
      
      // Upsert phone
      const { error: err2 } = await supabase.from("system_settings" as any).upsert({
        key: "support_phone",
        value: form.support_phone,
      });
      if (err2) throw err2;
    },
    onSuccess: () => {
      toast.success("Configurações atualizadas com sucesso!");
      qc.invalidateQueries({ queryKey: ["admin-system-settings"] });
      qc.invalidateQueries({ queryKey: ["system-settings"] }); // for the user facing button
    },
    onError: (e) => toast.error(traduzirErro(e)),
  });

  if (!isSuperAdmin) return null;

  return (
    <div>
      <PageHeader title="Administração Geral — Configurações Globais" subtitle="Configurações aplicadas a todos os usuários do sistema." />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : (
        <div className="rounded-xl border bg-card p-6 max-w-2xl mt-4">
          <h2 className="text-lg font-semibold mb-4">Dados de Suporte (Fale Conosco)</h2>
          <div className="space-y-4">
            <div>
              <Label>E-mail de Suporte</Label>
              <Input
                type="email"
                placeholder="exemplo@dominio.com"
                value={form.support_email}
                onChange={(e) => setForm({ ...form, support_email: e.target.value })}
              />
            </div>
            <div>
              <Label>Telefone de Suporte (WhatsApp)</Label>
              <Input
                placeholder="Ex: 5511999999999"
                value={form.support_phone}
                onChange={(e) => setForm({ ...form, support_phone: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">Inclua o código do país e DDD (Ex: 55 para Brasil).</p>
            </div>
            
            <Button 
              onClick={() => save.mutate()} 
              disabled={save.isPending}
              className="mt-4"
            >
              {save.isPending ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
