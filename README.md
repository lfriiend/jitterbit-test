# Desafio Técnico - API de Pedidos (Node.js + PostgreSQL)

Esta é uma API RESTful desenvolvida para gerenciar pedidos e itens, utilizando **Node.js (Express)** e **PostgreSQL** (com SQL puro/Native Driver). O projeto conta com autenticação JWT, documentação Swagger e ambiente containerizado com Docker.

## 🚀 Tecnologias Utilizadas

* **Node.js** (v20 Alpine)
* **Express** (Framework Web)
* **PostgreSQL** (Banco de Dados - Driver nativo `pg`)
* **Docker & Docker Compose** (Containerização)
* **JWT** (Autenticação JSON Web Token)
* **Swagger UI** (Documentação Interativa)
* **Yarn** (Gerenciador de Pacotes)

---

## 📋 Pré-requisitos

Para executar este projeto, você precisa apenas ter instalado:

* **Docker** e **Docker Compose**

> **Nota:** Não é necessário ter Node.js ou PostgreSQL instalados localmente na sua máquina, pois tudo rodará dentro dos containers.

---

## ⚡ Como Rodar a Aplicação

Siga os passos abaixo para iniciar o ambiente:

1.  **Clone o repositório e entre na pasta:**
    ```bash
    cd nome-da-pasta
    ```

2.  **Suba os containers (Build & Start):**
    Utilize o comando abaixo para construir a imagem e iniciar os serviços (API e Banco).
    ```bash
    docker-compose up --build
    ```

3.  **Aguarde a inicialização:**
    O terminal exibirá logs de conexão. Aguarde até ver a mensagem:
    > `✅ Banco de dados inicializado (Tabelas verificadas/criadas).`
    > `🚀 Servidor rodando em http://localhost:3000`

    *O sistema possui um script de migração automática (`initDb.js`) que cria as tabelas `Users`, `Order` e `Items` na primeira execução.*

---

## 📖 Documentação da API

### Swagger UI (Recomendado)
Acesse a documentação interativa e teste as rotas diretamente pelo navegador:

👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

---

## 🧪 Como Testar (Postman)

Na raiz deste projeto, você encontrará o arquivo `postman_collection.json`.

1.  Abra o **Postman**.
2.  Clique em **Import** e selecione o arquivo `postman_collection.json`.
3.  A collection **"Jitterbit Test API"** será carregada.

**Funcionalidade Automática:**
A collection possui um script configurado. Ao executar a rota **"Fazer Login"**, o Token JWT é salvo automaticamente nas variáveis, permitindo que você execute as rotas de Pedidos sem precisar copiar e colar o token manualmente.

---

## 🔐 Autenticação e Credenciais

As rotas de pedidos (`/order`) são protegidas e requerem um Token JWT (`Bearer Token`).

Para facilitar o teste, você pode usar os seguintes fluxos:

1.  **Registrar um usuário:** `POST /auth/register`
2.  **Fazer Login:** `POST /auth/login`

**Exemplo de Usuário para Teste:**
```json
{
  "username": "admin",
  "password": "123"
}