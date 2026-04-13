import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class LlmService {
  private ollama: OpenAI;
  private chatModel: string;
  private readonly logger = new Logger(LlmService.name);

  constructor(private configService: ConfigService) {
    this.ollama = new OpenAI({
      baseURL:
        this.configService.get<string>('OLLAMA_URL') ||
        'http://localhost:11434/v1',
      apiKey: 'ollama',
    });
    this.chatModel =
      this.configService.get<string>('CHAT_MODEL') || 'gemma3:4b';
  }

  /**
   * LLM-based reranking: scores how well a candidate fits a job AND explains why.
   * Returns structured JSON with fit_score (0-100) and explanation.
   */
  async scoreMatch(params: {
    resumeText: string;
    jobTitle: string;
    jobDescription: string;
    jobRequirements: string[];
  }): Promise<{ fit_score: number; explanation: string }> {
    const systemPrompt = `You are a strict career matching expert. Evaluate how well a candidate fits a job based on their resume vs the job requirements. Return ONLY valid JSON in this exact format:
{
  "fit_score": <number 0-100>,
  "explanation": "<2-3 sentences explaining the score>"
}

Scoring guide:
- 80-100: Strong fit. Has the required experience, skills, and seniority level.
- 60-79: Good fit. Has most skills but may be slightly under-qualified or junior to the role.
- 40-59: Weak fit. Partial overlap but missing key requirements (e.g. wrong specialization).
- 0-39: Not a fit. Different role entirely or missing core requirements.

Be STRICT. A frontend dev is NOT a QA engineer. A junior is NOT a senior. A backend dev is NOT a designer.`;

    const userPrompt = `RESUME:
${params.resumeText.slice(0, 3000)}

JOB TITLE: ${params.jobTitle}

JOB DESCRIPTION:
${params.jobDescription.slice(0, 1500)}

KEY REQUIREMENTS:
${params.jobRequirements.map((r) => `- ${r}`).join('\n')}

Return JSON only. No other text.`;

    try {
      const res = await this.ollama.chat.completions.create({
        model: this.chatModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 300,
      });

      const raw = res.choices[0]?.message?.content?.trim() ?? '';

      // Try direct JSON parse, fall back to regex extraction
      let parsed: { fit_score?: unknown; explanation?: unknown };
      try {
        parsed = JSON.parse(raw);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('No JSON in response');
        parsed = JSON.parse(match[0]);
      }

      const score = Math.max(
        0,
        Math.min(100, Math.round(Number(parsed.fit_score) || 0)),
      );
      const explanation = String(parsed.explanation || '').trim();

      return { fit_score: score, explanation };
    } catch (err) {
      this.logger.error('LLM scoreMatch failed:', err);
      return { fit_score: 0, explanation: 'Unable to evaluate match.' };
    }
  }

  async explainJobMatch(params: {
    resumeText: string;
    jobTitle: string;
    jobDescription: string;
    jobRequirements: string[];
  }): Promise<string> {
    const systemPrompt =
      'You are a career coach. Given a candidate resume and a job posting, explain in 2-3 concise sentences why this job is (or is not) a good fit. Focus on concrete skill, experience, and seniority overlap. Do not invent facts. Never exceed 3 sentences.';

    const userPrompt = `CANDIDATE RESUME:
${params.resumeText.slice(0, 4000)}

JOB TITLE: ${params.jobTitle}

JOB DESCRIPTION:
${params.jobDescription.slice(0, 2000)}

KEY REQUIREMENTS:
${params.jobRequirements.map((r) => `- ${r}`).join('\n')}

Explain the match in 2-3 sentences.`;

    try {
      const res = await this.ollama.chat.completions.create({
        model: this.chatModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 220,
      });
      return res.choices[0]?.message?.content?.trim() ?? '';
    } catch (err) {
      this.logger.error('Ollama chat call failed:', err);
      throw new Error('Failed to generate explanation');
    }
  }
}
