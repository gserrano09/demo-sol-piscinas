# Ambi Platform — Next.js 14 + Firebase

Plataforma completa com frontend público, dashboard de utilizador e backoffice admin.

---

## Stack

| | |
|-|-|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| UI | TailwindCSS |
| Auth | Firebase Authentication |
| Database | Firestore |
| Storage | Firebase Storage |
| Deploy | Vercel |

---

## Estrutura

```
app/
├── (public)/             ← Frontend público (sem auth obrigatória)
│   ├── page.tsx          ← Landing page
│   ├── products/         ← Lista de produtos
│   ├── products/[id]/    ← Detalhe de produto
│   └── login/            ← Login
├── dashboard/            ← Portal de utilizador (distribuidor/parceiro)
│   ├── page.tsx          ← Início / resumo
│   └── library/          ← Biblioteca de ficheiros
└── admin/                ← Backoffice (admin only)
    ├── page.tsx          ← Dashboard
    ├── products/         ← Gestão de produtos
    ├── upload/           ← Upload de ficheiros
    ├── users/            ← Gestão de utilizadores
    └── settings/         ← Empresas e configurações
```

---

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Firebase

Criar projecto em [console.firebase.google.com](https://console.firebase.google.com) com:
- Authentication (Email/Password)
- Firestore Database
- Storage

### 3. Variáveis de ambiente

Copiar `.env.local.example` para `.env.local` e preencher:

```bash
cp .env.local.example .env.local
```

### 4. Publicar regras de segurança

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules,storage
```

### 5. Criar primeiro admin

Na Firebase Console → Authentication → Add user: `it@ambiconcept.pt`

No Firestore → collection `users` → documento com o UID:
```json
{
  "name": "Admin",
  "email": "it@ambiconcept.pt",
  "role": "admin",
  "companyId": "",
  "active": true
}
```

### 6. Arrancar

```bash
npm run dev
# → http://localhost:3000
```

---

## Rotas

| Rota | Acesso | Descrição |
|------|--------|-----------|
| `/` | Público | Landing page |
| `/products` | Público | Catálogo de produtos |
| `/products/[id]` | Público | Detalhe de produto |
| `/login` | Público | Login |
| `/dashboard` | Autenticado | Início do portal |
| `/dashboard/library` | Autenticado | Biblioteca de ficheiros |
| `/admin` | Admin | Dashboard admin |
| `/admin/products` | Admin | Gestão de produtos |
| `/admin/upload` | Admin | Upload de ficheiros |
| `/admin/users` | Admin | Gestão de utilizadores |
| `/admin/settings` | Admin | Empresas e configs |

---

## Modelo de Dados

### `users`
```ts
{
  uid: string
  name: string
  email: string
  role: 'admin' | 'distribuidor' | 'parceiro'
  companyId: string
  active: boolean
  createdAt: Timestamp
}
```

### `companies`
```ts
{ id: string; name: string; country: string; active: boolean }
```

### `products`
```ts
{ id: string; name: string; description: string; companyId: string; tags: string[]; active: boolean }
```

### `resources`
```ts
{
  id: string
  name: string
  type: 'renders' | 'doc_tecnica' | 'doc_comercial' | 'social' | 'campanhas' | 'catalogos'
  url: string
  storagePath: string
  productId: string
  companyId: string
  mimeType: string
  size: number
}
```

---

## Permissões por Role

| Tipo de recurso | Admin | Distribuidor | Parceiro |
|-----------------|:-----:|:------------:|:--------:|
| renders | ✓ | ✓ | ✓ |
| doc_tecnica | ✓ | ✓ | ✗ |
| doc_comercial | ✓ | ✓ | ✓ |
| social | ✓ | ✓ | ✗ |
| campanhas | ✓ | ✗ | ✓ |
| catalogos | ✓ | ✓ | ✗ |

---

## Deploy no Vercel

```bash
vercel --prod
```

Adicionar as variáveis de ambiente no dashboard Vercel antes do deploy.

---

## Contacto

it@ambiconcept.pt
