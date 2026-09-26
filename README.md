# Clothing Store System - API

API REST para o **módulo de catálogo de uma loja de roupas**, desenvolvida como Atividade Prática Supervisionada (APS) da disciplina de Desenvolvimento Back-End (4º período de Engenharia de Software - Campus SJP).

## 1. Descrição do projeto

**Problema:** uma loja de roupas precisa manter seu catálogo organizado: saber quais peças vende, em quais categorias elas estão, quanto custam e se estão disponíveis para venda.

**Domínio:** loja de roupas. As peças (produtos) são organizadas em categorias, como Calças, Camisetas, Jaquetas, Moletons, Shorts e Acessórios.

**Objetivo da API:** permitir o cadastro, a consulta, a atualização e a exclusão de categorias e produtos, com os dados persistidos no Supabase (PostgreSQL). A API pode servir de back-end para uma vitrine virtual, um painel administrativo ou um sistema de autoatendimento da loja.

## 2. Integrantes da equipe

- Douglas Henrique Pereira Felix
- Alisson de Oliveira da Silva
- Felipe Teixeira

## 3. Tecnologias utilizadas

- Node.js
- TypeScript
- Express
- Supabase (`@supabase/supabase-js`)
- PostgreSQL
- tsx (execução do TypeScript em desenvolvimento)
- Postman (testes da API)
- Visual Studio Code (configuração de depuração em `.vscode/launch.json`)
- Git

## 4. Entidades e relacionamento

### Categoria (`categories`)

| Atributo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único (gerado automaticamente) |
| name | texto | Nome da categoria (obrigatório) |
| description | texto | Descrição da categoria |
| icon | texto | Ícone/emoji da categoria |
| display_order | inteiro | Ordem de exibição |
| active | booleano | Indica se a categoria está ativa |
| created_at | data/hora | Data de criação (automática) |

### Produto (`products`)

| Atributo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único (gerado automaticamente) |
| category_id | UUID | Categoria à qual o produto pertence (chave estrangeira, obrigatório) |
| name | texto | Nome do produto (obrigatório) |
| title | texto | Cópia do nome, preenchida automaticamente pela API (compatibilidade com a estrutura original) |
| description | texto | Descrição do produto |
| price | numérico | Preço (obrigatório, maior ou igual a zero) |
| image_url | texto | URL da imagem do produto |
| available | booleano | Indica se o produto está disponível para venda |
| active | booleano | Indica se o produto está ativo no catálogo |
| created_at | data/hora | Data de criação (automática) |

### Relacionamento

Uma **Categoria** pode possuir vários **Produtos**, e cada **Produto** pertence a uma única **Categoria** (relacionamento 1:N).

O relacionamento é garantido no banco por uma chave estrangeira: `products.category_id` referencia `categories.id`. Por isso:

- não é possível cadastrar um produto com uma categoria inexistente;
- não é possível excluir uma categoria que ainda possui produtos vinculados.

## 5. Estrutura do projeto

```
src/
├── config/
│   └── supabase.ts            # Conexão com o Supabase
├── controller/
│   ├── Categorycontroller.ts  # Regras HTTP, validações e respostas de categorias
│   └── Productcontroller.ts   # Regras HTTP, validações e respostas de produtos
├── model/
│   ├── Category.ts            # Interface (formato dos dados) de categoria
│   └── Product.ts             # Interface (formato dos dados) de produto
├── repositories/
│   ├── CategoryRepository.ts  # Consultas à tabela categories no Supabase
│   └── ProductRepository.ts   # Consultas à tabela products no Supabase
├── routes/
│   ├── categoryRoutes.ts      # Rotas /categories
│   └── productRoutes.ts       # Rotas /products
├── utils/
│   ├── httpError.ts           # Conversão de erros do banco em respostas HTTP
│   └── validation.ts          # Funções auxiliares de validação
├── app.ts                     # Configuração do Express e registro das rotas
└── server.ts                  # Inicialização do servidor
supabase/                      # Scripts SQL do banco de dados
postman/collections/clothing-store-API/   # Coleção do Postman (formato de arquivos)
.vscode/launch.json            # Configuração para depurar a API no VS Code
```

Fluxo de uma requisição:

```
Cliente → server.ts/app.ts → routes → controller → repository → Supabase (PostgreSQL)
```

- **Routes:** associam cada método HTTP e URL à função do controller.
- **Controllers:** validam os dados recebidos, chamam o repositório e definem o código HTTP da resposta.
- **Repositories:** executam as consultas no banco pelo cliente do Supabase.
- **Models:** descrevem o formato dos dados (interfaces TypeScript) usados pelos controllers e repositórios.

## 6. Configuração e execução

Pré-requisitos: Node.js (versão 20.6 ou superior) e um projeto criado no [Supabase](https://supabase.com).

1. Clone o repositório:

```bash
git clone https://github.com/SEU-USUARIO/clothing_store_system_sjp.git
cd clothing_store_system_sjp
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente copiando o arquivo de exemplo e preenchendo os valores (veja a seção 7):

```bash
cp .env.example .env
```

4. Crie as tabelas no Supabase executando os scripts da pasta `supabase/` no **SQL Editor** (veja a seção 8).

5. Inicie a aplicação em modo de desenvolvimento:

```bash
npm run dev
```

A API ficará disponível em `http://localhost:3000`.

Para depurar no VS Code, use a configuração **Debug API** (menu Executar e Depurar), que já carrega o `.env`.

Para gerar e executar a versão compilada:

```bash
npm run build
npm start
```

> Observação: o `npm start` executa `dist/server.js` sem carregar o `.env` automaticamente. Nesse caso, use `node --env-file=.env dist/server.js` ou defina as variáveis no ambiente.

## 7. Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `SUPABASE_URL` | URL do projeto no Supabase (Project Settings → API) |
| `SUPABASE_SECRET_KEY` | Chave secreta do projeto (Project Settings → API Keys) |
| `PORT` | Porta do servidor (padrão: 3000) |

O arquivo `.env.example` contém apenas valores de exemplo:

```
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SECRET_KEY=sua_chave_secreta
PORT=3000
```

**Importante:** o arquivo `.env` com as credenciais reais está listado no `.gitignore` e **não deve ser enviado ao repositório**.

## 8. Banco de dados

O banco utiliza duas tabelas no schema `public` do Supabase:

```
categories (1) ────< (N) products
    id  ◄──────────────── category_id
```

Os scripts ficam na pasta `supabase/` e devem ser executados no **SQL Editor** do Supabase, nesta ordem:

| Ordem | Script | Obrigatório? | Finalidade |
|---|---|---|---|
| 1 | `01_tabelas.sql` | Sim, em banco novo | Cria as tabelas, as chaves primárias UUID, a chave estrangeira e o índice |
| 2 | `02_ajustes_banco_existente.sql` | Sim, em banco existente | Cria as colunas e a chave estrangeira que estiverem faltando, sem apagar dados |
| 3 | `03_rls.sql` | Recomendado | Ativa o Row Level Security. A API usa a chave secreta e continua funcionando |
| 4 | `04b_seed_loja_roupas.sql` | Não | Insere categorias e produtos de exemplo |

Scripts auxiliares:

- `00_diagnostico.sql`: consulta a estrutura atual das tabelas (somente leitura).
- `04a_limpar_dados.sql`: apaga todos os dados das tabelas (**irreversível**).

Estrutura principal (resumo do `01_tabelas.sql`):

```sql
create table public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    description text,
    icon text,
    display_order integer not null default 0,
    active boolean not null default true,
    created_at timestamptz not null default now()
);

create table public.products (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null references public.categories (id)
        on update cascade on delete restrict,
    name text not null,
    title text,
    description text,
    price numeric(10, 2) not null check (price >= 0),
    image_url text,
    available boolean not null default true,
    active boolean not null default true,
    created_at timestamptz not null default now()
);
```

## 9. Documentação dos endpoints

### Geral

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/` | Retorna o nome e a versão da API |

### Categorias

| Método | Endpoint | Descrição | Corpo da requisição |
|---|---|---|---|
| GET | `/categories` | Lista todas as categorias, ordenadas por `display_order` | - |
| GET | `/categories/:id` | Consulta uma categoria pelo ID | - |
| GET | `/categories/search/:keyword` | Pesquisa categorias por palavra-chave no nome ou na descrição | - |
| POST | `/categories` | Cadastra uma nova categoria | `name` (obrigatório), `description`, `icon`, `display_order`, `active` |
| PUT | `/categories/:id` | Atualiza uma categoria | Um ou mais campos da categoria |
| DELETE | `/categories/:id` | Remove uma categoria (somente se não houver produtos vinculados) | - |

### Produtos

| Método | Endpoint | Descrição | Corpo da requisição |
|---|---|---|---|
| GET | `/products` | Lista todos os produtos, ordenados por nome | - |
| GET | `/products/:id` | Consulta um produto pelo ID | - |
| POST | `/products` | Cadastra um novo produto | `category_id`, `name` e `price` (obrigatórios), `description`, `image_url`, `available`, `active` |
| PUT | `/products/:id` | Atualiza um produto | Um ou mais campos do produto |
| DELETE | `/products/:id` | Remove um produto | - |

### Validações

- Os IDs informados na URL devem ser UUIDs válidos.
- `name` é obrigatório na criação e não pode ser vazio (até 100 caracteres em categorias e 150 em produtos).
- `price` deve ser um número maior ou igual a zero.
- `category_id` deve ser um UUID de uma categoria existente.
- `image_url` vazio é gravado como sem imagem.
- `display_order` deve ser um número inteiro maior ou igual a zero.
- `active` e `available` devem ser `true` ou `false`.
- No `PUT`, é preciso enviar ao menos um campo válido. Campos não previstos são ignorados.

### Códigos de resposta HTTP

| Código | Quando ocorre |
|---|---|
| 200 OK | Consulta, atualização ou exclusão realizada com sucesso |
| 201 Created | Registro criado com sucesso |
| 400 Bad Request | ID inválido, dados inválidos, JSON mal formatado ou categoria inexistente informada no produto |
| 404 Not Found | Registro ou rota não encontrados |
| 409 Conflict | Tentativa de excluir uma categoria que possui produtos vinculados |
| 500 Internal Server Error | Erro inesperado no servidor ou no banco de dados |

## 10. Exemplos de requisições

### Criar categoria: `POST /categories`

```json
{
  "name": "Calças",
  "description": "Calças jeans, de moletom, sociais e esportivas.",
  "icon": "👖",
  "display_order": 1,
  "active": true
}
```

Resposta `201 Created`:

```json
{
  "id": "0b8f5c1e-3d2a-4c7b-9f10-2a6e8d4c1b53",
  "name": "Calças",
  "description": "Calças jeans, de moletom, sociais e esportivas.",
  "icon": "👖",
  "display_order": 1,
  "active": true,
  "created_at": "2026-09-23T14:30:00.000Z"
}
```

### Atualizar categoria: `PUT /categories/:id`

```json
{
  "description": "Calças jeans, de moletom e de sarja.",
  "display_order": 2
}
```

### Criar produto: `POST /products`

```json
{
  "category_id": "0b8f5c1e-3d2a-4c7b-9f10-2a6e8d4c1b53",
  "name": "Calça de Moletom",
  "description": "Calça de moletom unissex com elástico e cordão na cintura.",
  "price": 119.90,
  "image_url": "https://exemplo.com/imagens/calca-moletom.jpg",
  "available": true,
  "active": true
}
```

### Atualizar produto: `PUT /products/:id`

```json
{
  "price": 99.90,
  "available": false
}
```

### Exemplo de erro de validação (`400 Bad Request`)

```json
{
  "message": "Dados inválidos.",
  "errors": [
    "O campo 'name' é obrigatório e deve ser um texto não vazio.",
    "O campo 'price' é obrigatório e deve ser um número maior ou igual a zero."
  ]
}
```

### Testes com o Postman

A pasta `postman/collections/clothing-store-API` contém todas as requisições da API, no formato de arquivos do Postman (workspace local configurado em `.postman/resources.yaml`). Abra a pasta do projeto no Postman ou importe a pasta da coleção, e substitua `<id-da-categoria>` e `<id-do-produto>` por IDs reais do seu banco.
