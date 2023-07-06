import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { MessageService } from './message.service';
import { MessageResponse } from './interfaces/messageResponse.interface';

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('v1/message')
  @HttpCode(200)
  async send(@Req() request: Request): Promise<MessageResponse> {
    const messages = request.body.messages || [];
    const response = await this.messageService.complete(messages);
    return { result: response.content };
  }
}
