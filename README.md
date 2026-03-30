# 💎 Quark Solutions - Lead Management System

Desafio técnico de Backend focado no gerenciamento, enriquecimento e classificação de leads comerciais para o setor de investimentos, utilizando NestJS, RabbitMQ e IA Local (Ollama).

## 🚀 Como Executar o Projeto

### **1. Pré-requisitos**

* Docker e Docker Compose instalados.

* Node.js (v20 ou superior).

### **2. Instalação e Configuração**

#### Clone o repositório

````
git clone https://github.com/lucaslimeres/quark-solutions-backend-challenge.git
````

````
cd quark-solutions-backend-challenge
````

#### Instale as dependências

````
npm install
````

#### Configure o ambiente

````
cp .env.example .env
````

### **3. Subir Infraestrutura (Docker)**

Este comando inicia o PostgreSQL, RabbitMQ, a API de Mock e o Ollama.

Nota: No primeiro arranque, o contentor do Ollama fará o download automático do modelo tinyllama (~637MB). Aguarde alguns instantes até que o serviço esteja pronto.
````
docker-compose up -d
````

### **4. Preparar a Base de Dados**

#### Executa as migrations do Prisma

````
npx prisma migrate dev
````

#### Popula a base de dados com dados iniciais (Seeds)

````
npx prisma db seed
````

### **5. Execução**

#### Iniciar a API e o Consumer (Modo Desenvolvimento)
````
npm run start:dev
````

## 🛠 Comandos Principais

| Objetivo                      | Comando                         |
|-------------------------------|---------------------------------|
| Subir Infra (Docker)          | ``docker-compose up -d``        |
| Executar Testes Unitários     | ``npm run test``                |
| Executar Testes de Integração | ``npm run test:e2e``            |
| Cobertura de Código           | ``npm run test:cov``            |
| Interface da Base de Dados    | ``npx prisma studio``           |
| Logs do Worker (IA)           | ``docker logs -f quark_ollama`` |

## 📊 Modelação de Dados

A arquitetura de dados foi desenhada para garantir que cada tentativa de processamento seja auditável de forma independente, permitindo o rastreio da evolução do lead.

````
erDiagram
    LEAD ||--o ENRICHMENT_HISTORY : "possui"
    LEAD ||--o CLASSIFICATION_HISTORY : "possui"

    LEAD {
        string id PK
        string fullName
        string email UK
        string phone
        string companyCnpj UK
        float estimatedValue
        enum source
    }

    ENRICHMENT_HISTORY {
        string id PK
        string leadId FK
        json payload
        enum status
        string errorMessage
        datetime requestedAt
        datetime completedAt
    }

    CLASSIFICATION_HISTORY {
        string id PK
        string leadId FK
        int score
        string classification
        string justification
        string modelUsed
        enum status
        datetime requestedAt
        datetime completedAt
    }
````

## 📮 API Endpoints (Exemplos)

``POST /leads``: Criação de novo lead.

``GET /leads``: Listagem de todos os leads existentes.

``GET /leads/:id``: Detalhes do lead.

``PATCH /leads/:id``: Atualização do lead.

``DELETE /leads/:id``: Exclusão do lead.

``GET /leads/:id/enrichment``: Listagem do histórico de enriquecimento do Lead.

``POST /leads/:id/enrichment``: Enriquecimento do Lead através de API externa.

``GET /leads/:id/classification``: Listagem do histórico de classificação do Lead.

``POST /leads/:id/classification``: Classificação do Lead através de IA.

``GET /leads/:id/export``: Exportação consolidada com filtros de classificação e período.

Desenvolvido por Lucas Limeres.