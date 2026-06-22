-- 1) Tabela de documentos do cliente (catálogo)
CREATE TABLE public.documentos_cliente (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL,
  categoria text NOT NULL,
  nome_doc text NOT NULL,
  storage_path text NOT NULL,
  tamanho_bytes bigint,
  tipo_mime text,
  status text NOT NULL DEFAULT 'pendente_analise'
    CHECK (status IN ('aguardando','pendente_analise','aprovado','reprovado')),
  motivo_reprovacao text,
  enviado_por uuid NOT NULL DEFAULT auth.uid(),
  enviado_em timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX documentos_cliente_cliente_idx ON public.documentos_cliente(cliente_id);
CREATE INDEX documentos_cliente_enviado_por_idx ON public.documentos_cliente(enviado_por);

-- 2) GRANTs Data API
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos_cliente TO authenticated;
GRANT ALL ON public.documentos_cliente TO service_role;

-- 3) RLS
ALTER TABLE public.documentos_cliente ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário gerencia seus próprios documentos"
  ON public.documentos_cliente
  FOR ALL
  USING (auth.uid() = enviado_por)
  WITH CHECK (auth.uid() = enviado_por);

-- 4) Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_documentos_cliente_updated_at
  BEFORE UPDATE ON public.documentos_cliente
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Políticas no storage.objects para o bucket 'documentos-clientes'
--    O bucket precisa ser criado manualmente no painel do Supabase (privado).
CREATE POLICY "Usuário autenticado lê seus documentos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documentos-clientes' AND owner = auth.uid());

CREATE POLICY "Usuário autenticado faz upload de documentos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documentos-clientes' AND owner = auth.uid());

CREATE POLICY "Usuário autenticado atualiza seus documentos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documentos-clientes' AND owner = auth.uid());

CREATE POLICY "Usuário autenticado remove seus documentos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documentos-clientes' AND owner = auth.uid());