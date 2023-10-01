import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProviderService } from 'src/ai-provider/ai-provider.service';
import { Readable } from 'stream';

@Injectable()
export class TranscriptionService {
  private readonly logger = new Logger(TranscriptionService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly aiProviderService: AiProviderService,
  ) {}

  async transcribeAudio(audio: Express.Multer.File): Promise<string> {
    const openai = this.aiProviderService.getAiConnection();

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
      this.logger.error('OpenAI error', error.response?.data);
      throw new InternalServerErrorException(
        'Failed to transcribe audio. Please try again.',
      );
    }
  }
}
