CREATE TABLE IF NOT EXISTS public.system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users" 
ON public.system_settings FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow all for super_admin" 
ON public.system_settings FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'super_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'super_admin'
  )
);

INSERT INTO public.system_settings (key, value)
VALUES 
  ('support_email', '"thedinjoaopedro@gmail.com"'),
  ('support_phone', '"5522999211638"')
ON CONFLICT (key) DO NOTHING;
