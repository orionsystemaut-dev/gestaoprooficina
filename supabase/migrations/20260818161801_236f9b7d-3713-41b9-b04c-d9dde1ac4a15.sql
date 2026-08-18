-- 1) Restringir políticas "public" a usuários autenticados
DROP POLICY IF EXISTS "appt read" ON public.appointments;
CREATE POLICY "appt read" ON public.appointments FOR SELECT TO authenticated
USING (public.is_super_admin(auth.uid()) OR public.is_member(auth.uid(), unit_id) OR public.is_company_admin(auth.uid(), public.unit_company(unit_id)));

DROP POLICY IF EXISTS "appt write" ON public.appointments;
CREATE POLICY "appt write" ON public.appointments FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid()) OR public.is_company_admin(auth.uid(), public.unit_company(unit_id)) OR public.has_unit_role(auth.uid(), unit_id, ARRAY['oficina_admin'::app_role,'mecanico'::app_role,'recepcionista'::app_role]))
WITH CHECK (public.is_super_admin(auth.uid()) OR public.is_company_admin(auth.uid(), public.unit_company(unit_id)) OR public.has_unit_role(auth.uid(), unit_id, ARRAY['oficina_admin'::app_role,'mecanico'::app_role,'recepcionista'::app_role]));

DROP POLICY IF EXISTS "inv read" ON public.invitations;
CREATE POLICY "inv read" ON public.invitations FOR SELECT TO authenticated
USING (public.is_super_admin(auth.uid()) OR public.is_member(auth.uid(), unit_id));

DROP POLICY IF EXISTS "inv insert" ON public.invitations;
CREATE POLICY "inv insert" ON public.invitations FOR INSERT TO authenticated
WITH CHECK (public.is_super_admin(auth.uid()) OR public.has_unit_role(auth.uid(), unit_id, ARRAY['oficina_admin'::app_role,'recepcionista'::app_role]));

DROP POLICY IF EXISTS "inv modify admin" ON public.invitations;
CREATE POLICY "inv modify admin" ON public.invitations FOR UPDATE TO authenticated
USING (public.is_super_admin(auth.uid()) OR public.is_unit_admin(auth.uid(), unit_id))
WITH CHECK (public.is_super_admin(auth.uid()) OR public.is_unit_admin(auth.uid(), unit_id));

DROP POLICY IF EXISTS "inv delete admin" ON public.invitations;
CREATE POLICY "inv delete admin" ON public.invitations FOR DELETE TO authenticated
USING (public.is_super_admin(auth.uid()) OR public.is_unit_admin(auth.uid(), unit_id));

-- 2) Funções de gatilho: não devem ser chamáveis via API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.recalc_os_total() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_finance_audit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_protect_super_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_reopen_service_order_from_child() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_reopen_service_order_on_main_edit() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_units_create_subscription() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_units_grant_creator_membership() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_contas_pagar_gerar_parcelas() FROM PUBLIC, anon, authenticated;

-- 3) Funções auxiliares de permissão: apenas usuários autenticados
REVOKE ALL ON FUNCTION public.access_active(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_manage_company(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_manage_unit(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_read_profile(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_update_profile(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_unit_role(uuid, uuid, app_role[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_company_admin(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_company_owner(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_unit_admin(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.unit_company(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.next_os_number(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.access_active(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_company(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_unit(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_read_profile(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_update_profile(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_unit_role(uuid, uuid, app_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_company_owner(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_unit_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unit_company(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.next_os_number(uuid) TO authenticated;

-- 4) Login por usuário precisa continuar acessível antes do login
GRANT EXECUTE ON FUNCTION public.resolve_username_email(text) TO anon, authenticated;