import { Injectable, Logger } from '@nestjs/common';
import { Ollama } from 'ollama';
import { ENVS } from 'src/utils/enviroments';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private ollama: Ollama;

  constructor() {
    this.ollama = new Ollama({ host: ENVS.OLLAMA.URL });
  }

  async classifyLead(leadData: any) {
    const modelUsed = ENVS.OLLAMA.MODEL || 'tinyllama';
    const requestedAt = new Date();

    const prompt = `
      Você é um especialista em investimentos.
      Analise os dados deste lead e retorne APENAS um JSON válido.
      
      Dados do Lead: ${JSON.stringify(leadData)}

      Regras de Classificação:
      - Hot: Decisores (CEO, Diretor), empresas grandes ou investimento estimado > 100k.
      - Warm: Gerentes ou profissionais liberais com investimento médio.
      - Cold: Estagiários ou perfis sem fit financeiro claro.

      O JSON deve seguir este formato estritamente:
      {
        "score": (número inteiro de 0 a 100),
        "classification": "Hot" | "Warm" | "Cold",
        "justification": "uma frase curta",
        "commercialPotential": "High" | "Medium" | "Low"
      }
    `;

    try {
      const response = await this.ollama.generate({
        model: modelUsed,
        prompt: prompt,
        format: 'json',
        stream: false,
      });

      const completedAt = new Date();
      const result = JSON.parse(response.response);

      return {
        ...result,
        modelUsed,
        requestedAt,
        completedAt,
        status: 'SUCCESS',
      };
    } catch (error) {
      this.logger.error(`Erro na classificação Ollama: ${error.message}`);
      return {
        status: 'FAILED',
        errorMessage: error.message,
        requestedAt,
        completedAt: new Date(),
        modelUsed,
      };
    }
  }
}