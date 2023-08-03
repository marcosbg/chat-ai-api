import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration, OpenAIApi } from 'openai';
import { Readable } from 'stream';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);

  constructor(private readonly configService: ConfigService) {}

  async transcribeAudio(audio: Express.Multer.File): Promise<string> {
    const configuration = new Configuration({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);
    if (!configuration.apiKey) {
      this.logger.error('OpenAI API key not configured');
      throw new InternalServerErrorException('OpenAI API key not configured', {
        description:
          'OpenAI API key not configured, please follow instructions in README.md',
      });
    }

    try {
      this.logger.log('Sending audio to be transcribed by OpenAI');

      const audioReadStream = Readable.from(audio.buffer);
      //@ts-expect-error - OpenAI types are not updated
      audioReadStream.path = 'audio.m4a';

      const response = await openai.createTranscription(
        //@ts-expect-error - OpenAI types are not updated
        audioReadStream,
        this.configService.get<string>('OPENAI_MODEL_WHISPER'),
        undefined,
        undefined,
        0.5,
        'en',
      );

      this.logger.log('Audio transcribed by OpenAI: ' + response.data.text);
      return response.data.text;
    } catch (error) {
      if (error.response) {
        this.logger.error('OpenAI error', error.response.data);
        throw new InternalServerErrorException('OpenAI error', {
          description: error.response.data,
          cause: error.response.data.error,
        });
      } else {
        this.logger.error('Code error', error);
        throw new InternalServerErrorException('Code error', {
          description: error,
        });
      }
    }
  }
}
