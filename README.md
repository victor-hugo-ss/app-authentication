# 🔐 JourneyDoc

> Exemplo didático de autenticação com **Fastify**, **Passport** e **Sequelize/SQLite** — combinando sessões por cookie e tokens JWT em uma aplicação web simples e bem estruturada.

---

## ✨ Recursos

| Recurso              | Descrição                                     |
| -------------------- | --------------------------------------------- |
| 📝 Registro & Login  | Formulários web com views Handlebars          |
| 🍪 Sessão por Cookie | `fastify-session` + `fastify-cookie`          |
| 🔑 Passport Local    | Autenticação com usuário e senha              |
| 🪙 JWT               | Tokens para rotas de API protegidas           |
| 🗄️ SQLite            | Persistência via Sequelize (modelo `Account`) |
| 🔒 Hash seguro       | PBKDF2 + salt com `crypto.pbkdf2Sync`         |

---

## 🧩 Stack

```
Node.js (ESM)  ·  Fastify  ·  Passport (local + jwt)
fastify-passport  ·  fastify-session  ·  fastify-cookie
Sequelize  ·  SQLite3  ·  Handlebars  ·  dotenv
```

---

## 📁 Estrutura do projeto

```
├── 📁 db
│   └── 📦 database.sqlite    # Criado automaticamente (não versionar)
├── 📁 models
│   └── 📄 Account.js         # Modelo Account: registro, autenticação e JWT
├── 📁 views
│   ├── 📄 dashboard.hbs      # Painel protegido
│   └── 📄 index.hbs          # Formulário de login/registro
├── ⚙️ .env                   # Variáveis de ambiente (ver abaixo)
├── ⚙️ .gitignore
├── 📝 README.md
├── 📄 db.js                  # Configuração do Sequelize/SQLite
├── 📄 index.js               # Servidor Fastify, rotas e configuração do Passport
├── ⚙️ package.json
└── 📦 yarn.lock
```

---

## ⚙️ Configuração

### Pré-requisitos

- Node.js 18+
- SQLite3
- npm ou yarn

### Variáveis de ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
PORT=3000
SECRET="sua_chave_de_sessao_forte_e_unica_32+_chars"
JWT_SECRET="uma_chave_secreta_para_jwt_igualmente_segura"
```

> `SECRET` — criptografa as sessões do servidor.  
> `JWT_SECRET` — assina os tokens JWT.

---

## 🚀 Instalação e execução

```bash
# Instalar dependências
npm install      # ou: yarn install

# Produção
npm start

# Desenvolvimento (nodemon)
npm run dev
```

Acesse em: [http://127.0.0.1:3000](http://127.0.0.1:3000)

---

## 🗺️ Rotas

### Web (formulários)

| Método | Rota            | Descrição                                              |
| ------ | --------------- | ------------------------------------------------------ |
| `GET`  | `/?page=login`  | Formulário de login                                    |
| `GET`  | `/?page=signup` | Formulário de registro                                 |
| `POST` | `/account`      | Cria conta (`username`, `password`, `confirmPassword`) |
| `POST` | `/auth`         | Autentica via formulário e cria sessão                 |
| `GET`  | `/dashboard`    | Painel protegido por sessão                            |
| `GET`  | `/logout`       | Encerra a sessão                                       |

### API (token)

| Método | Rota        | Proteção       | Descrição                       |
| ------ | ----------- | -------------- | ------------------------------- |
| `POST` | `/api/auth` | Passport Local | Retorna `{ token }`             |
| `GET`  | `/api/test` | Passport JWT   | Rota protegida por Bearer token |

### Exemplos com cURL

```bash
# 1. Obter token
curl -X POST -d "username=demo&password=senha" \
  http://127.0.0.1:3000/api/auth
# → { "token": "eyJhbGciOi..." }

# 2. Usar rota protegida
curl -H "Authorization: Bearer <TOKEN>" \
  http://127.0.0.1:3000/api/test
# → { "status": "Authenticated." }
```

---

## 🔄 Fluxo de autenticação

```
┌─────────────────────────────────────────────────────────┐
│  REGISTRO                                               │
│  POST /account → Account.register()                     │
│    ↳ gera salt + hash (PBKDF2, 1200 iter.) → salva DB  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  LOGIN via FORMULÁRIO                                   │
│  POST /auth → Passport Local valida credenciais         │
│    ↳ Account.authenticate() → request.login()           │
│    ↳ cria sessão de cookie                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  LOGIN via API                                          │
│  POST /api/auth → Passport Local (session: false)       │
│    ↳ retorna JWT assinado com { username }              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ROTA PROTEGIDA                                         │
│  GET /api/test → Passport JWT Strategy                  │
│    ↳ extrai Bearer token → valida → autoriza            │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ Segurança e melhorias recomendadas

> Este projeto é **didático**. Para uso em produção, considere:

- **🔑 PBKDF2:** Aumentar iterações para 100.000+ ou migrar para `argon2`
- **🔒 HTTPS:** Marcar cookie como `secure` e usar TLS em produção
- **🛡️ Validação:** Sanitizar entradas (tamanho e caracteres de `username`/`password`)
- **🚦 Rate limiting:** Proteção contra força bruta e lockout de contas
- **📦 Migrações:** Usar Sequelize CLI em vez de `sync` automático
- **🤫 Erros:** Evitar expor mensagens de erro sensíveis ao cliente

---

## 💡 Dicas de desenvolvimento

- **App não inicia?** Verifique se `.env` contém `SECRET` e `JWT_SECRET`.
- **Resetar dados:** Remova ou renomeie `db/database.sqlite` — ele é recriado automaticamente.
- **Logs do banco:** Ative `logging: console.log` no `db.js` para depurar queries.
- **`.gitignore`:** O arquivo SQLite já está listado — não o versione.

---

## 🔭 Possíveis extensões

- [ ] OAuth com Google / GitHub
- [ ] Recuperação de senha via e-mail
- [ ] Refresh tokens para JWT
- [ ] Sessões em Redis (para escalar horizontalmente)
- [ ] Separar rotas em controllers dedicados

---

## 📄 Licença

[MIT](LICENSE)

---

> Projeto criado como estudo e referência para padrões de autenticação com Fastify e Passport.  
> Sinta-se livre para experimentar, melhorar e contribuir! 🚀
