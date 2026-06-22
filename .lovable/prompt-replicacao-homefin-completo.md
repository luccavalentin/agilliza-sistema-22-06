# PROMPT MASTER — Replicação Completa do Sistema Agilliza com Integração HomeFin API

> **Objetivo**: Documentação em formato de prompt, dividida em micro-etapas sequenciais, para replicar 100% deste sistema (design, menus, login, módulos, IA, integrações) em um novo projeto Lovable, já preparado para **produção real** com:
> - Integração oficial com a **API HomeFin** (simulações, propostas, status, contratos);
> - Conexão configurável com as principais **IAs do mercado** (Gemini, Claude/Anthropic, GPT/OpenAI, Mistral, DeepSeek, Grok) usadas pelos módulos **Scan IA** e **Flash IA**;
> - Armazenamento **criptografado** de todas as chaves de API;
> - **Controle de permissão por nível de usuário** — apenas usuários **Master** acessam/visualizam/editam configurações sensíveis.

> **Stack-alvo**: TanStack Start + React 19 + Tailwind v4 + shadcn/ui + Lovable Cloud (Supabase: Postgres, RLS, Auth, Edge Functions, Storage, Vault) + Lovable AI Gateway.

> **Instrução de uso**: Cole as etapas no Lovable **uma por vez**, na ordem. Cada etapa é independente e validável. Não pule etapas — a sequência respeita dependências (auth → roles → schema → módulos → IA → integrações).

---

## SUMÁRIO DE MICRO-ETAPAS

**Bloco A — Fundação (1–6)**
1. Bootstrap do projeto e identidade visual
2. Design System (tokens, tipografia, cores institucionais)
3. Estrutura de rotas e shell de portais (4 portais)
4. Tela de Login e Recuperação de Senha
5. Schema de Autenticação + Tabela de Perfis
6. Sistema de Papéis (`app_role`) e função `has_role`

**Bloco B — Schema de Domínio (7–12)**
7. Cadastros administrativos (bancos, imobiliárias, produtos, equipe)
8. CRM — Clientes, Cônjuges, Compositores de Renda
9. Operacional — Simulações, Propostas, Demandas, Tarefas, SLA
10. Financeiro — Contas a Pagar/Receber, Comissões, Categorias, Recorrências, Conciliação
11. Documentos — Storage e tabela de documentos por cliente/proposta
12. Auditoria — log de alterações em entidades sensíveis

**Bloco C — Configurações Seguras e APIs (13–18)** ⚠️ Núcleo do pedido
13. Tabela de configurações de integração (criptografada)
14. Vault / Edge Function para encrypt/decrypt de chaves
15. Tela "Configurações → Integrações" (somente Master)
16. Pré-cadastro dos provedores de IA (Gemini, Claude, GPT, Mistral, DeepSeek, Grok)
17. Pré-cadastro da integração HomeFin (endpoints + credenciais)
18. Guarda de rota e RLS para configurações sensíveis

**Bloco D — Integração HomeFin (19–24)**
19. Mappers HomeFin (produtos, tipos de imóvel, estado civil, renda)
20. Edge Function `homefin-auth` (login/refresh token)
21. Edge Function `homefin-simulacao` (envio + retorno multi-banco)
22. Edge Function `homefin-proposta` (criação + acompanhamento de status)
23. Edge Function `homefin-webhook` (recebimento de atualizações)
24. Sincronização HomeFin ↔ tabelas locais (jobs + realtime)

**Bloco E — Módulos de IA (25–28)**
25. Edge Function `scan-ia` (OCR multi-provedor via chave do tenant)
26. Edge Function `flash-ia` (assistente conversacional)
27. UI Scan IA e Flash IA reaproveitando provedores configurados
28. Fallback e seleção dinâmica do provedor por módulo

**Bloco F — Módulos Funcionais (29–36)**
29. Dashboard Correspondente + filtros (período personalizado, analista)
30. Dashboard Corretor / Cliente
31. CRM completo (cadastro, consultas, relatórios)
32. Operacional (simulações, propostas, kanban, demandas, tarefas)
33. Financeiro (painel, lançamentos, comissões, fluxo de caixa, relatórios)
34. Relatórios Gerenciais (Processos / Aprovadas / Contratos)
35. Portal do Cliente (acompanhamento + assinatura)
36. Backup e exportação de dados

**Bloco G — Produção (37–40)**
37. Remoção total de dados mockados → leitura via Supabase
38. Realtime, otimização e SEO
39. Hardening de segurança (RLS audit, secrets, CORS)
40. Checklist final de Go-Live

---

# BLOCO A — FUNDAÇÃO

## ETAPA 1 — Bootstrap do projeto e identidade visual

```
Crie um novo projeto Lovable em TanStack Start com Tailwind v4 e shadcn/ui já configurados.
Identidade visual do sistema "Agilliza" (correspondente bancário):
- Nome: Agilliza Crédito
- Paleta institucional:
  • Brand primário: #001BBF (azul institucional profundo)
  • Brand secundário: #0A8FDC (azul claro)
  • Sucesso: #00B35A | Alerta: #FF8A00 | Erro: #E02323 | Roxo/IA: #7A7AF1
  • Grafite (texto): #1A1A2E | Surface: #FFFFFF | Background: #F6F7FB
- Tipografia: Inter (corpo) + Inter Display (títulos), pesos 400/600/700
- Estilo: cards com borda 1px sutil, radius 8–12px, sombras suaves, eyebrow em UPPERCASE com tracking amplo, KPIs com barra de 4px superior na cor da métrica.

Configure src/styles.css com tokens HSL semânticos (--brand, --brand-foreground, --surface, --graphite, --success, --warning, --destructive, --ai). Não use cores hardcoded em componentes.
```

## ETAPA 2 — Design System (primitivas)

```
Crie src/components/dashboards/primitives.tsx com:
- <PanelHeader eyebrow title subtitle right /> — cabeçalho padrão de toda tela
- <Kpi label value accent trend /> — card de métrica com barra superior colorida
- <SectionCard title description children /> — wrapper padrão
- <FilterBar period product bank broker status analista dateRange onChange /> — barra de filtros REATIVA (não decorativa). Suporta período "Personalizado" com inputs De/Até. Botão "Limpar" aparece quando há filtros aplicados.

Use shadcn select, input, button. Todos os filtros são controlled components com onChange.
```

## ETAPA 3 — Estrutura de rotas e shell de portais

```
Crie 4 portais com rotas em src/routes/:
1. /correspondente/* — gestor master da operação
2. /corretor/* — corretor parceiro
3. /cliente/* — portal do cliente final
4. /auth, /auth/reset-password — públicas

Cada portal usa <PortalShell kind groups> com:
- Sidebar colapsável agrupada (Visão Geral, CRM, Operacional, Financeiro, Gestão, Configurações, Backup)
- Topbar com busca global, notificações, menu de conta
- <Outlet /> para conteúdo

Grupos do portal Correspondente:
- Visão Geral → Painel
- CRM → Scan IA, Flash IA, Dashboard, Cadastro, Consultas, Relatórios
- Operacional → Painel, Consultas, Simulações, Minhas Simulações, Propostas, Demandas & SLA, Tarefas, Atualização, Relatórios
- Financeiro → Painel, Contas a Pagar, Contas a Receber, Comissões, Categorias, Recorrências, Conciliação, Fluxo de Caixa, Relatórios
- Gestão Administrativa → Cadastros Gerais
- Configurações → Configurações do Sistema
- Backup → Backup do Sistema
```

## ETAPA 4 — Login e Recuperação de Senha

```
Crie src/routes/auth.tsx com:
- Layout split-screen: lado esquerdo branding Agilliza (logo grande, frase institucional, gradiente brand), lado direito formulário centralizado.
- Tabs: "Entrar" e "Criar conta"
- Campos: e-mail, senha; "Esqueci minha senha" abre dialog que chama supabase.auth.resetPasswordForEmail com redirectTo = window.location.origin + '/auth/reset-password'
- Após login, redireciona conforme papel: master/admin → /correspondente, corretor → /corretor, cliente → /cliente

Crie src/routes/auth.reset-password.tsx (PÚBLICA) que detecta type=recovery, exibe form de nova senha e chama supabase.auth.updateUser({ password }).

Crie src/routes/_authenticated/route.tsx (ssr:false) com beforeLoad chamando supabase.auth.getUser() e redirecionando para /auth se não houver sessão. Mova todas as rotas autenticadas para baixo de _authenticated/.
```

## ETAPA 5 — Schema de Auth + Profiles

```
Crie migration:

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  avatar_url TEXT,
  correspondente_id UUID,           -- multi-tenant
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user reads own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "user updates own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Trigger auto-criação de profile no signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email), NEW.email);
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## ETAPA 6 — Papéis e função `has_role`

```
CREATE TYPE public.app_role AS ENUM ('master', 'admin', 'analista', 'backoffice', 'comercial', 'corretor', 'cliente');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user reads own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- Hook React: src/hooks/use-role.ts → useHasRole('master') retorna boolean via RPC
```

---

# BLOCO B — SCHEMA DE DOMÍNIO

## ETAPA 7 — Cadastros administrativos
```
Tabelas: bancos, imobiliarias, corretores_parceiros, produtos_financeiros, equipe_interna.
Todas com correspondente_id, RLS por correspondente, GRANTs para authenticated/service_role.
Seed inicial via migration: Caixa, Bradesco, Itaú, Santander, BB, Inter; produtos FI e HE.
```

## ETAPA 8 — CRM
```
Tabelas: clientes, conjuges, compositores_renda, enderecos_cliente, documentos_cliente.
Campos do cliente alinhados ao payload HomeFin (CPF, RG, estado_civil, regime_casamento, tipo_renda, renda_bruta, usa_fgts, saldo_fgts).
RLS: corretor vê só seus clientes; master/admin vê todos do correspondente.
```

## ETAPA 9 — Operacional
```
Tabelas: simulacoes, propostas, propostas_bancos (multi-banco), demandas, tarefas, sla_configs, status_proposta_log.
Status alinhados ao HomeFin: SIMULACAO → ANALISE → APROVADA → CONTRATACAO → ASSINATURA → LIBERADA → CANCELADA.
```

## ETAPA 10 — Financeiro
```
Tabelas: contas_pagar, contas_receber, lancamentos, categorias_financeiras, comissoes, recorrencias, conciliacao_bancaria, fluxo_caixa_view.
Comissão calculada a partir de proposta.valor_liberado × percentual_corretor.
```

## ETAPA 11 — Documentos + Storage
```
Bucket privado "documentos-clientes" com policies por correspondente_id no path.
Tabela documentos: id, cliente_id, proposta_id, tipo (RG/CNH/HOLERITE/IR/...), storage_path, ocr_json, status.
```

## ETAPA 12 — Auditoria
```
Tabela audit_log (entity, entity_id, action, before, after, user_id, created_at).
Trigger genérico em profiles, user_roles, integration_configs, propostas.
```

---

# BLOCO C — CONFIGURAÇÕES SEGURAS E APIs ⚠️ CORE DO PEDIDO

## ETAPA 13 — Tabela de configurações de integração (criptografada)

```
Habilite a extensão pgsodium (ou pgcrypto + Supabase Vault):

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE integration_provider AS ENUM (
  'homefin', 'openai', 'anthropic', 'google_gemini',
  'mistral', 'deepseek', 'xai_grok', 'lovable_ai'
);

CREATE TABLE public.integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correspondente_id UUID NOT NULL,
  provider integration_provider NOT NULL,
  display_name TEXT NOT NULL,
  -- Chave SEMPRE criptografada via Vault; nunca armazenar plaintext
  encrypted_api_key TEXT NOT NULL,
  encrypted_api_secret TEXT,
  base_url TEXT,
  model_default TEXT,             -- ex: 'gpt-5', 'gemini-2.5-pro', 'claude-sonnet-4'
  extra_config JSONB DEFAULT '{}'::jsonb,  -- temperatura, maxTokens, endpoints custom
  enabled BOOLEAN DEFAULT TRUE,
  used_for TEXT[] DEFAULT '{}',   -- ['scan_ia','flash_ia','homefin']
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (correspondente_id, provider, display_name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_configs TO authenticated;
GRANT ALL ON public.integration_configs TO service_role;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;

-- APENAS MASTER pode ler/escrever
CREATE POLICY "only master reads configs" ON public.integration_configs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'master'));

CREATE POLICY "only master writes configs" ON public.integration_configs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'master'))
  WITH CHECK (public.has_role(auth.uid(), 'master'));
```

## ETAPA 14 — Edge Function de criptografia

```
Crie duas Edge Functions (Supabase) com SERVICE_ROLE:
- POST /functions/v1/config-encrypt  { plaintext } → { ciphertext }
- POST /functions/v1/config-decrypt  { ciphertext } → { plaintext }

Usam SUPABASE_VAULT_KEY (secret de 32 bytes) + AES-256-GCM via SubtleCrypto do Deno.
NUNCA expor a chave ao cliente. As chamadas validam que o caller é master via JWT + has_role.

A UI envia plaintext, recebe ciphertext, e armazena ciphertext em integration_configs.encrypted_api_key.
Para uso (Scan IA, HomeFin, etc.), outras Edge Functions chamam config-decrypt internamente.
```

## ETAPA 15 — Tela "Configurações → Integrações" (somente Master)

```
Rota: /correspondente/configuracoes/integracoes  (gated por has_role('master'))
Componente: src/components/configuracoes/integracoes-view.tsx

Layout:
- 3 abas: "Inteligências Artificiais" | "HomeFin API" | "Outras Integrações"

Aba IA (cada provedor é um card):
┌─ Google Gemini ─────────────────────────┐
│ Status: [● Conectado | ○ Não conectado] │
│ Modelo padrão: [select: gemini-2.5-pro] │
│ API Key:  ••••••••••••3F2A  [Editar]   │
│ Usar para: [x] Scan IA  [x] Flash IA   │
│ [Testar conexão]  [Salvar]              │
└─────────────────────────────────────────┘

Repete para: OpenAI (GPT-5, GPT-5-mini), Anthropic (Claude Sonnet 4),
Mistral, DeepSeek, xAI Grok, Lovable AI Gateway (default).

Aba HomeFin:
- Ambiente: [select: Produção | Sandbox]
- Base URL: [input pré-preenchido https://api.homefin.com.br/v1]
- Client ID: [input]
- Client Secret: [password, criptografado]
- Webhook Secret: [password, criptografado]
- [Testar autenticação] → chama Edge homefin-auth e mostra "OK" ou erro

REGRAS:
- Chaves nunca exibidas em plaintext após salvar (apenas últimos 4 chars).
- Botão "Editar" abre dialog com input password e exige reconfirmação de senha do usuário.
- Toda operação chama config-encrypt antes de persistir.
- Audit log automático em cada save.
```

## ETAPA 16 — Pré-cadastro dos provedores de IA

```
Seed inicial (migration):
INSERT INTO integration_providers_catalog (provider, display_name, default_base_url, default_models, docs_url) VALUES
('google_gemini','Google Gemini','https://generativelanguage.googleapis.com/v1beta',
   ARRAY['gemini-2.5-pro','gemini-2.5-flash','gemini-2.0-flash'], 'https://aistudio.google.com/apikey'),
('openai','OpenAI GPT','https://api.openai.com/v1',
   ARRAY['gpt-5','gpt-5-mini','gpt-5-nano','gpt-4o'], 'https://platform.openai.com/api-keys'),
('anthropic','Anthropic Claude','https://api.anthropic.com/v1',
   ARRAY['claude-sonnet-4-5','claude-opus-4','claude-haiku-4'], 'https://console.anthropic.com/'),
('mistral','Mistral AI','https://api.mistral.ai/v1',
   ARRAY['mistral-large-latest','mistral-small-latest'], 'https://console.mistral.ai/'),
('deepseek','DeepSeek','https://api.deepseek.com/v1',
   ARRAY['deepseek-chat','deepseek-reasoner'], 'https://platform.deepseek.com/'),
('xai_grok','xAI Grok','https://api.x.ai/v1',
   ARRAY['grok-4','grok-3'], 'https://console.x.ai/'),
('lovable_ai','Lovable AI Gateway','https://ai.gateway.lovable.dev/v1',
   ARRAY['google/gemini-2.5-pro','openai/gpt-5','anthropic/claude-sonnet-4'], 'https://docs.lovable.dev');

Tabela auxiliar para popular dropdowns de modelo dinamicamente.
```

## ETAPA 17 — Pré-cadastro da integração HomeFin

```
Seed em integration_providers_catalog para 'homefin':
- default_base_url: https://api.homefin.com.br/v1  (ajuste conforme docs oficiais)
- Campos obrigatórios: client_id, client_secret, webhook_secret, environment
- Endpoints documentados (jsonb):
  {
    "auth":         "POST /oauth/token",
    "simulacao":    "POST /simulacoes",
    "proposta":     "POST /propostas",
    "status":       "GET  /propostas/{id}",
    "bancos":       "GET  /bancos",
    "documentos":   "POST /propostas/{id}/documentos",
    "webhook":      "recebe em /api/public/webhooks/homefin"
  }
```

## ETAPA 18 — Guarda de rota + RLS para configs

```
- Componente <RequireMaster> que usa useHasRole('master') e redireciona para /correspondente se false.
- Item de menu "Integrações" só aparece se isMaster.
- RLS já garantido na ETAPA 13. Testar com usuário não-master: SELECT deve retornar 0 linhas.
```

---

# BLOCO D — INTEGRAÇÃO HOMEFIN

## ETAPA 19 — Mappers HomeFin

```
Crie src/lib/operacional/homefin-mappers.ts com:
- Enums: TipoImovel (AP/CS/GA/TE/TC), UsoImovel (R/C), SituacaoImovel (N/U),
  EstadoCivil (S/CA/UE/DI/VI), RegimeCasamento (CP/CU/ST/PF),
  TipoRenda (F/I/FI), Produto (FI/HE), SistemaAmortizacao (SAC/PRICE)
- Função buildSimulacaoPayload(dados) → objeto pronto para POST /simulacoes
- Função parseSimulacaoResponse(json) → normaliza para tabela simulacoes
```

## ETAPA 20 — Edge Function `homefin-auth`

```
supabase/functions/homefin-auth/index.ts
- Lê integration_configs WHERE provider='homefin' AND correspondente_id=...
- Decifra client_id e client_secret via config-decrypt
- POST {baseURL}/oauth/token (client_credentials)
- Cacheia access_token em tabela homefin_tokens (correspondente_id, token, expires_at)
- Retorna token válido (refresh automático 5min antes de expirar)
```

## ETAPA 21 — Edge Function `homefin-simulacao`

```
supabase/functions/homefin-simulacao/index.ts
Input: { simulacao_id }
Fluxo:
1. Lê simulacoes WHERE id=... (RLS via JWT do usuário)
2. Chama homefin-auth para obter token
3. Monta payload via mapper
4. POST {baseURL}/simulacoes
5. Persiste resultado em propostas_bancos (uma linha por banco retornado)
6. Atualiza simulacoes.status='CONCLUIDA' e retorna ao cliente
Tratamento de erros: 401 → reautentica e tenta 1x; 4xx/5xx → grava em integration_errors_log.
```

## ETAPA 22 — Edge Function `homefin-proposta`

```
supabase/functions/homefin-proposta/index.ts
Ações: 'criar' | 'atualizar_status' | 'enviar_documentos'
- criar: envia proposta + cliente + cônjuge + compositores; recebe id_homefin; grava em propostas.external_id
- atualizar_status: GET /propostas/{external_id}; sincroniza status local
- enviar_documentos: multipart com arquivos do Storage
```

## ETAPA 23 — Edge Function `homefin-webhook`

```
Rota PÚBLICA: src/routes/api/public/webhooks/homefin.ts
- Valida HMAC SHA256 com webhook_secret (timing-safe compare)
- Eventos: proposta.atualizada, proposta.aprovada, proposta.cancelada, documento.solicitado
- Atualiza tabela propostas + insere em status_proposta_log + cria notificação para responsáveis
```

## ETAPA 24 — Sincronização HomeFin ↔ local

```
- pg_cron (a cada 15min): chama Edge homefin-sync para propostas em status ANALISE/CONTRATACAO
- Supabase Realtime habilitado em propostas e propostas_bancos
- UI escuta channel e atualiza Kanban automaticamente
```

---

# BLOCO E — MÓDULOS DE IA

## ETAPA 25 — Edge Function `scan-ia` (multi-provedor)

```
supabase/functions/scan-ia/index.ts
Input: { documento_id, provider_preferido? }
Fluxo:
1. Resolve provedor: provider_preferido OU primeiro integration_configs com used_for contém 'scan_ia' e enabled=true
2. Decifra API key via config-decrypt
3. Baixa arquivo do Storage (signed URL interna)
4. Monta requisição conforme provedor:
   - Gemini: generativelanguage.googleapis.com/v1beta/models/{model}:generateContent (inline_data base64)
   - OpenAI: /v1/chat/completions com image_url base64
   - Anthropic: /v1/messages com image source base64
5. Prompt unificado (extrair RG/CNH/CPF/holerite/comprovante/IR/extrato) → JSON estruturado
6. Persiste em documentos.ocr_json + atualiza confianca
```

## ETAPA 26 — Edge Function `flash-ia`

```
supabase/functions/flash-ia/index.ts
Assistente conversacional sobre clientes/propostas.
- Stream SSE
- Function calling: buscar_cliente, buscar_proposta, calcular_simulacao, listar_pendencias
- Mesma resolução dinâmica de provedor (used_for='flash_ia')
- Histórico em flash_ia_conversations
```

## ETAPA 27 — UI Scan IA e Flash IA

```
src/components/crm/scan-ia.tsx
- Upload drag-and-drop (PDF/JPG/PNG até 10MB)
- Após upload: chama scan-ia → preenche automaticamente form de cadastro de cliente
- Indicador do provedor usado + nível de confiança

src/components/crm/flash-ia.tsx
- Chat full-screen estilo Claude/ChatGPT
- Markdown rendering
- Botão "Trocar IA" se houver múltiplos provedores configurados
```

## ETAPA 28 — Fallback e seleção dinâmica

```
Hook src/hooks/use-ai-provider.ts:
- useAiProvider('scan_ia') → retorna { provider, model, callEdge() }
- Se provedor primário falhar 2x, tenta segundo configurado
- Master pode marcar "provedor padrão" por módulo em /configuracoes/integracoes
```

---

# BLOCO F — MÓDULOS FUNCIONAIS

## ETAPA 29 — Dashboard Correspondente
```
KPIs reativos a FilterBar: propostas em andamento, valor total, aprovadas, contratos emitidos.
Filtros: período (7/30/90d/ano/PERSONALIZADO de-até), banco, produto (FI/HE), analista, status, imobiliária, corretor.
Hook use-dashboard-filters consolida estado.
Drill-down em KPIs abre <DetailDialog> com lista filtrada.
```

## ETAPA 30 — Dashboards Corretor / Cliente
```
Corretor: pipeline pessoal, comissões previstas/pagas, ranking.
Cliente: timeline da proposta, documentos pendentes, próximos passos.
```

## ETAPA 31 — CRM
```
Cadastro com Scan IA integrado, consultas (Bacen, Score — opcional via APIs configuradas),
relatórios por origem/corretor/conversão.
```

## ETAPA 32 — Operacional
```
Simulações (wizard 4 etapas chamando homefin-simulacao),
Propostas (Kanban arrastável por status),
Demandas & SLA, Tarefas, Atualização de Proposta,
Relatórios operacionais.
```

## ETAPA 33 — Financeiro
```
Contas a Pagar/Receber, Lançamentos, Comissões (auto-calculadas),
Categorias, Recorrências, Conciliação Bancária (OFX/CNAB futuro),
Fluxo de Caixa, Relatórios.
```

## ETAPA 34 — Relatórios Gerenciais
```
3 grandes blocos solicitados pelo cliente:
A) Processos em andamento: por valor/banco, por tipo (FI/HE), por analista adm, por analista comercial (split banco), por imobiliária/corretor, por fase.
B) Propostas aprovadas: por data, banco, analistas, imobiliária/corretor, tipo.
C) Contratos emitidos: por data emissão, analistas, imobiliária/corretor, tipo, valor/banco.
Exportação PDF e CSV.
```

## ETAPA 35 — Portal do Cliente
```
Login do cliente final, acompanhamento da proposta, upload de pendências,
assinatura eletrônica (futuro — placeholder), notificações.
```

## ETAPA 36 — Backup
```
src/components/backup/backup-module.tsx
- Exporta dump JSON via Edge Function (apenas master)
- Restauração manual via SQL Editor (documentado)
```

---

# BLOCO G — PRODUÇÃO

## ETAPA 37 — Remoção total de mocks
```
Auditar e remover:
- src/lib/operacional/mock-data.ts
- src/lib/financeiro/mock-data.ts
- src/lib/crm-clients.ts (mock)
- src/data/store.ts e repositories.ts (in-memory)

Substituir por hooks Supabase: useQuery + supabase.from(...).select(...).
Cada tela deve mostrar empty state real quando não houver dados, NUNCA dados fictícios.
```

## ETAPA 38 — Realtime + SEO
```
- Habilitar realtime nas tabelas: propostas, propostas_bancos, demandas, tarefas, notificacoes
- SEO em cada rota pública: head() com title <60 chars, meta description <160, OG, canonical
- Lazy load de imagens, code-splitting por rota (TanStack faz automático)
```

## ETAPA 39 — Hardening
```
- Rodar security--run_security_scan e zerar findings
- Verificar todas as tabelas com RLS habilitado e policies escopadas a auth.uid()/correspondente
- CORS restrito em Edge Functions públicas
- Rate limit em homefin-webhook
- Rotacionar LOVABLE_API_KEY e validar secrets
```

## ETAPA 40 — Checklist Go-Live
```
[ ] Todas as tabelas com GRANTs + RLS + policies testadas
[ ] Auth funcionando (signup, login, reset password)
[ ] Roles atribuídos (pelo menos 1 usuário master ativo)
[ ] /configuracoes/integracoes acessível só para master
[ ] Chaves de IA e HomeFin cadastradas e testadas (botão "Testar conexão" verde)
[ ] homefin-simulacao retorna dados reais de pelo menos 1 banco
[ ] homefin-webhook recebendo eventos de teste corretamente
[ ] Scan IA extrai dados reais de RG/CNH/Holerite
[ ] Flash IA responde com contexto real do banco
[ ] Nenhuma tela com mock — empty states adequados
[ ] Filtros funcionais em todos os dashboards (incluindo personalizado de-até e por analista)
[ ] Relatórios A/B/C gerenciais exportando PDF/CSV
[ ] Backup executando com sucesso
[ ] Security scan sem findings críticos/altos
[ ] SEO básico em todas as rotas públicas
[ ] Domínio customizado configurado (opcional)
[ ] Publicado em produção
```

---

## OBSERVAÇÕES FINAIS DE SEGURANÇA

1. **Chaves NUNCA em plaintext**: nem no banco, nem em logs, nem em respostas de API. Sempre via Vault/AES-GCM.
2. **Master é o único papel** com acesso a `/configuracoes/integracoes`. Garantido por RLS + guarda de rota + ocultação de menu.
3. **Auditoria obrigatória** em toda alteração de `integration_configs` e `user_roles`.
4. **Webhooks** sempre validam HMAC antes de qualquer escrita.
5. **Edge Functions sensíveis** validam JWT + has_role antes de decifrar credenciais.
6. **Rotacione chaves** periodicamente; o sistema deve permitir trocar uma chave sem downtime (criar nova, marcar antiga como disabled).
7. **Backups criptografados** e somente master pode disparar/baixar.

---

**FIM DO PROMPT MASTER.** Cole as etapas no Lovable em ordem. Cada bloco é validável de forma independente.
