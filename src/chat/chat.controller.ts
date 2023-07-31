import {
  Controller,
  HttpCode,
  Logger,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Express, Request } from 'express';
import { ChatService } from './chat.service';
import { ChatMessageResponse } from './interfaces/chatMessageResponse.interface';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('v1/chat')
export class ChatController {
  private readonly logger = new Logger(ChatService.name);
  constructor(private readonly messageService: ChatService) {}

  @Post('message')
  @HttpCode(200)
  async sendMessage(@Req() request: Request): Promise<ChatMessageResponse> {
    const dialogueId = request.body.dialogueId || 1;
    const messages = request.body.messages || [];
    const response = await this.messageService.sendMessage(
      dialogueId,
      messages,
    );
    return { result: response.content };
  }

  @Post('audio')
  @UseInterceptors(FileInterceptor('audio'))
  @HttpCode(200)
  async sendAudio(@UploadedFile() audio: Express.Multer.File): Promise<string> {
    this.logger.log('Receving audio: ' + audio.originalname);
    //const response = await this.messageService.sendAudio(audio);
    return 'Recevied audio: ' + audio.originalname;
  }
}
