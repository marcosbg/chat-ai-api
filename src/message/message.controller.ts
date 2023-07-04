import {
  BadRequestException,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Post,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';

@Controller()
export class MessageController {
  constructor(private readonly configService: ConfigService) {}

  @Post('v1/message')
  @HttpCode(200)
  async send(@Req() request: Request): Promise<Object> {
    const configuration = new Configuration({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);
    if (!configuration.apiKey) {
      throw new InternalServerErrorException('OpenAI API key not configured', {
        description:
          'OpenAI API key not configured, please follow instructions in README.md',
      });
    }

    const messages = request.body.messages || [];
    if (messages.length === 0) {
      throw new BadRequestException('Please enter a valid message', {
        description:
          'No messages provided, at least one message is needed to continue the conversation',
      });
    }

    try {
      const response = await openai.createChatCompletion({
        model: this.configService.get<string>('OPENAI_MODEL'),
        messages: this.appendSystemMessage(messages),
        temperature: 0.5,
        max_tokens: 150,
      });
      return { result: response.data.choices[0].message.content };
    } catch (error) {
      if (error.response) {
        throw new InternalServerErrorException("OpenAI error", {
          description: error.response.data,
          cause: error.response.data.error,
        });
      }
    }
  }

  appendSystemMessage(messages: ChatCompletionRequestMessage[]): ChatCompletionRequestMessage[] {
    return [{ role: "system", content: this.generateSystemMessage() }, ...messages];
  }
  
  generateSystemMessage(): string {
    return "You work in a shopping center and the customer wants to buy a purse in your store. Help the customer to buy the product. Write short sentences with basic english.";
  }
}
