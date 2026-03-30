import 'dotenv/config';

export const ENVS ={
  SERVER: {
    PORT: process.env.SERVER_PORT || 3000
  },

  DATABASE: {
    URL: process.env.DATABASE_URL || 'postgresql://admin:root@localhost:5432/quark_database?schema=public',
    HOST: process.env.DATABASE_HOST || 'localhost',
    PORT: process.env.DATABASE_PORT || 5432,
    USER: process.env.DATABASE_USER || 'admin',
    PASSWORD: process.env.DATABASE_PASSWORD || 'root',
    NAME: process.env.DATABASE_NAME || 'quark_database'
  },

  RABBITMQ: {
    URL: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    USER: process.env.RABBITMQ_USER || 'guest',
    PASSWORD: process.env.RABBITMQ_PASSWORD || 'guest',
    HOST: process.env.RABBITMQ_HOST || 'localhost',
    PORT: process.env.RABBITMQ_PORT || 5672,
    MAX_RETRIES: parseInt(process.env.RABBITMQ_MAX_RETRIES || '5'),
    QUEUE: process.env.RABBITMQ_QUEUE || 'lead_queue'
  },

  API: {
    MOCK_URL: process.env.API_MOCK_URL || 'http://localhost:3333/enrichLead'
  },

  OLLAMA: {
    URL: process.env.OLLAMA_URL || 'http://localhost:11434',
    MODEL: process.env.OLLAMA_MODEL || 'tinyllama'
  }
}