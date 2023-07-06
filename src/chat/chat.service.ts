import {
  Logger,
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from 'openai';
import { ChatMessage } from './interfaces/chatMessage.interface';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  constructor(private readonly configService: ConfigService) {}

  async sendMessage(messages: ChatMessage[]): Promise<ChatMessage> {
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
    if (messages.length === 0) {
      this.logger.error('No messages provided');
      throw new BadRequestException('Please enter a valid message', {
        description:
          'No messages provided, at least one message is needed to continue the conversation',
      });
    }

    const chatMessages: ChatCompletionRequestMessage[] = messages.map(
      (message) => {
        return {
          role: message.role as ChatCompletionRequestMessageRoleEnum,
          content: message.content,
        };
      },
    );

    try {
      this.logger.log('Sending message to OpenAI');
      const response = await openai.createChatCompletion({
        model: this.configService.get<string>('OPENAI_MODEL'),
        messages: this.generateArrayForCompletition(chatMessages),
        temperature: 0.5,
        max_tokens: 150,
      });
      this.logger.log('Message sent to OpenAI');
      return {
        role: response.data.choices[0].message.role,
        content: response.data.choices[0].message.content,
      };
    } catch (error) {
      if (error.response) {
        this.logger.error('OpenAI error', error.response.data);
        throw new InternalServerErrorException('OpenAI error', {
          description: error.response.data,
          cause: error.response.data.error,
        });
      }
    }
  }
  private generateArrayForCompletition(
    messages: ChatCompletionRequestMessage[],
  ): ChatCompletionRequestMessage[] {
    return [
      { role: 'system', content: this.generateSystemMessage() },
      ...messages,
    ];
  }

  private generateSystemMessage(): string {
    return 'You work in a shopping center and the customer wants to buy a purse in your store. Help the customer to buy the product. Write short sentences with basic english.';
  }
}
