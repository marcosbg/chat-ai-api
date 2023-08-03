import { Controller, HttpCode, Logger, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { ChatService } from './chat.service';
import { ChatMessageResponse } from './interfaces/chatMessageResponse.interface';

@Controller('v1/chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);
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
}
