import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { ChatService } from './chat.service';
import { ChatMessageResponse } from './interfaces/chatMessageResponse.interface';

@Controller('v1/chat')
export class ChatController {
  constructor(private readonly messageService: ChatService) {}

  @Post('message')
  @HttpCode(200)
  async sendMessage(@Req() request: Request): Promise<ChatMessageResponse> {
    const messages = request.body.messages || [];
    const response = await this.messageService.sendMessage(messages);
    return { result: response.content };
  }
}
