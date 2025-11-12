# TESTE PRÁTICO ESCOLAS

Sistema completo para gerenciamento de escolas, com autenticação, upload de CSV, edição e visualização de informações detalhadas.  
O projeto inclui **frontend (React)**, **backend (Node + Express + JWT)** e **banco MySQL** totalmente integrado via **Docker Compose**.

---

## Estrutura do Projeto

```
.
├── backend/
│   ├── src/
│   ├── routes/
│   ├── db.js
│   ├── init.sql
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

### Clone o repositório
git clone https://github.com/anamirand/DESAFIOHOUER-ANA.git

###  Configurando o backend

```bash
cd backend
yarn install
```

Crie um arquivo `.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=escolas_db
JWT_SECRET=meusegredoseguro
```

Inicie o servidor:

```bash
yarn start
```

---

### Configurando o frontend

```bash
cd frontend
yarn install
yarn start
```

---

## Rodando com Docker (recomendado)

### 1Iniciar tudo com **um único comando**

Na raiz do projeto:

```bash
docker compose up -d --build
```

Isso inicia:
- MySQL
- Backend (porta 5000)
- Frontend (porta 3000)

---

## Credenciais de Acesso

| Campo | Valor |
|-------|--------|
| Email | **admin@teste.com** |
| Senha | **123456** |

---

## Tecnologias Utilizadas

### **Backend**
- Node.js  
- Express  
- MySQL  
- JWT  
- Multer (upload de CSV)  
- bcrypt  

### **Frontend**
- React  
- Axios  
- Lucide React  
- CSS puro  

### **Infraestrutura**
- Docker & Docker Compose  
- MySQL 8  

---

## Funcionalidades Principais

- Login com JWT  
- Upload de arquivo CSV  
- Verificação se o arquivo já está no banco  
- Listagem paginada (100 por página)  
- Ordenação mostrando itens novos no topo  
- Expansão de detalhes completos por escola  
- Edição e exclusão de escolas  
- Tela de adicionar escola  
- Modal com mais de 100 colunas  
- Apenas usuários logados podem acessar `/schools`

---

## Script do Banco (`init.sql`)

```sql
CREATE DATABASE IF NOT EXISTS escolas_db;
USE escolas_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (email, senha)
VALUES (
  'admin@teste.com',
  '$2b$10$0J.EwpFb8AGzB5Ep4kQvSuK/De9h2QmFb3/If/1Us/.zHgKXAzvwi'
)
ON DUPLICATE KEY UPDATE email = email;

CREATE TABLE IF NOT EXISTS schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codesc VARCHAR(50),
  nomesc VARCHAR(255),
  mun VARCHAR(255),
  tipoesc_desc VARCHAR(255),
  nomedep VARCHAR(255),
  distr VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Comandos Úteis

Ver containers:

```bash
docker ps
```

Parar e remover tudo:

```bash
docker compose down -v
```

Logs:

```bash
docker compose logs -f
```

---

## Portas

| Serviço | Porta |
|--------|--------|
| Frontend | 3000 |
| Backend  | 5000 |
| MySQL    | 3306 |

---

Desenvolvido como desafio técnico, com integração completa backend + frontend + MySQL via Docker.

---
