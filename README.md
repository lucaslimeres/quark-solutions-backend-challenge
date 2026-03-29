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

A arquitetura de dados foi desenhada para suportar a Regra 6.5 (Histórico), garantindo que cada tentativa de processamento seja auditável de forma independente, permitindo o rastreio da evolução do lead.

erDiagram
    LEAD ||--o{ ENRICHMENT_HISTORY : "possui"
    LEAD ||--o{ CLASSIFICATION_HISTORY : "possui"

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


🧠 Decisões Técnicas e Trade-offs

1. Arquitetura Baseada em Eventos (Event-Driven)

Decisão: Utilização do RabbitMQ para desacoplar a ingestão de leads do processamento pesado (IA e APIs externas).

Trade-off: Introduz latência eventual (o lead não  é classificado no exato segundo do POST), mas garante que a API suporte alta carga e que falhas externas não causem perda de dados.

2. IA Local com Ollama (TinyLlama)

Decisão: Uso do tinyllama rodando localmente em contentor.

Trade-off: Embora menos potente que modelos como GPT-4, oferece custo zero por requisição, privacidade total dos dados sensíveis da Quark Solutions e baixíssima latência por não depender de rede externa.

3. Estratégia de Resiliência (Retry Pattern)

Decisão: Implementação de Manual Ack no RabbitMQ com controlo de x-death.

Trade-off: Aumenta a complexidade do código do Consumer, mas permite que o sistema tente processar o lead novamente caso o contentor da IA esteja sobrecarregado ou a API de Mock sofra instabilidade.

4. Persistência de Histórico Imutável

Decisão: Criação de tabelas de histórico separadas em vez de colunas na tabela de Leads.

Trade-off: Consome mais espaço em disco no longo prazo, porém permite auditar a evolução do score do lead e rastrear falhas técnicas de forma granular (exigência do teste).

5. Testes com Vitest

Decisão: Migração do Jest para o Vitest.

Trade-off: Oferece execução de testes significativamente mais rápida e integração nativa com ESM/SWC, melhorando a produtividade do desenvolvedor.

📮 API Endpoints (Exemplos)

POST /leads: Criação de novo lead.

GET /leads/export: Exportação consolidada com filtros de classificação e período.

GET /leads/:id: Detalhes do lead com histórico completo de auditoria de enriquecimento e classificação.

Desenvolvido por Lucas Limeres.