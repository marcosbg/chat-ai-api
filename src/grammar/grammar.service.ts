import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProviderService } from 'src/ai-provider/ai-provider.service';
import GrammarResponse from './interfaces/grammarResponse';
import * as Diff from 'text-diff';

@Injectable()
export class GrammarService {
  private readonly logger = new Logger(GrammarService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly aiProviderService: AiProviderService,
  ) {}

  async convertToGrammar(text: string): Promise<GrammarResponse> {
    const openai = this.aiProviderService.getAiConnection();

    const SYSTEM_ROLE = 'system';
    const USER_ROLE = 'user';
    const PROMPT =
      'You will be provided with statements, and your task is to convert them to standard English. In cas teh statement is already in standard english, return the same statement.';

    let standard = '';

    try {
      const gptResponse = await openai.createChatCompletion({
        model: this.configService.get<string>('OPENAI_MODEL_CHAT'),
        messages: [
          { role: SYSTEM_ROLE, content: PROMPT },
          { role: USER_ROLE, content: text },
        ],
        top_p: 1,
        temperature: 0,
        max_tokens: 256,
      });

      standard = gptResponse.data.choices[0].message.content;
    } catch (error) {
      this.logger.error('OpenAI error', error.response?.data);
      throw new InternalServerErrorException(
        'Failed to convert to standard grammar. Please try again.',
      );
    }

    const diff = new Diff();
    const textDiff = diff.main(text, standard);

    return { original: text, standard, diff: textDiff };
  }
}
