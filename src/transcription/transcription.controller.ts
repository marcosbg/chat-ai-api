import {
  Controller,
  HttpCode,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { TranscriptionService } from './transcription.service';
import { FileInterceptor } from '@nestjs/platform-express/multer';

@Controller('v1/transcription')
export class TranscriptionController {
  private readonly logger = new Logger(TranscriptionController.name);

  constructor(private readonly transcriptionService: TranscriptionService) {}

  @Post()
  @UseInterceptors(FileInterceptor('audio'))
  @HttpCode(200)
  async sendAudio(@UploadedFile() audio: Express.Multer.File): Promise<string> {
    this.logger.log('Receving audio: ' + audio.originalname);
    const response = await this.transcriptionService.transcribeAudio(audio);
    return response;
  }
}
