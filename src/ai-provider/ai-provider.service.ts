import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration, OpenAIApi } from 'openai';

@Injectable()
export class AiProviderService {
  private readonly logger = new Logger(AiProviderService.name);

  constructor(private readonly configService: ConfigService) {}

  getAiConnection(): OpenAIApi {
    const configuration = new Configuration({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });

    const openai = new OpenAIApi(configuration);

    if (!configuration.apiKey) {
      this.logger.error('OpenAI API key not configured');
      throw new BadRequestException(
        'OpenAI API key not configured, please follow instructions in README.md',
      );
    }

    return openai;
  }
}
