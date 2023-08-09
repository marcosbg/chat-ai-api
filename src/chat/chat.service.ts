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

  async getInitialMessage(dialogueId: string): Promise<ChatMessage> {
    const initialMessage = this.findInitialMessage(dialogueId);
    this.logger.log('Initial message found: ' + initialMessage);
    return {
      role: 'assistant',
      content: initialMessage,
    };
  }

  async sendMessage(
    dialogueId: number,
    messages: ChatMessage[],
  ): Promise<ChatMessage> {
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
        model: this.configService.get<string>('OPENAI_MODEL_CHAT'),
        messages: this.generateArrayForCompletition(dialogueId, chatMessages),
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
    dialogueId: number,
    messages: ChatCompletionRequestMessage[],
  ): ChatCompletionRequestMessage[] {
    return [
      { role: 'system', content: this.getSystemMessage(dialogueId) },
      ...messages,
    ];
  }

  private getSystemMessage(dialogueId: number): string {
    const systemMessages = new Map<number, string>();

    systemMessages.set(
      1,
      `You work in a shopping center and the customer wants to buy clothes in your store.If you are a seller, you should:
      1. Greet the customer.
      2. Ask the customer what he wants to buy.
      3. Provide options to the customer.
      Write short sentences with basic english.`,
    );

    systemMessages.set(
      2,
      `This is a dialogue between 2 friends and you are one of this friends.
      They meet each other in a cafe and talk about their lives.
      If you are a friend, you should:
      1. Greet the other friend.
      2. Ask the other friend what he/she has been doing.
      3. Tell the other friend what you have been doing.
      Write short sentences with basic english.`,
    );

    systemMessages.set(
      3,
      `A costumer arrives in a restaurant and wants to order food. The AI is the waiter.
      If you are a waiter, you should:
      1. Greet the customer.
      2. Ask the customer what he wants to order.
      3. Provide options to the customer.
      4. Ask the customer if he wants something for drink.
      5. Let the customer know that the food will be ready soon.
      Write short sentences with basic english.`,
    );

    systemMessages.set(
      4,
      `The AI is doing a jon interview with a candidate. The candidate you provide answers 
      whreas the interviewer will try to understand the candidate profile and experiences.
      The interviewer should make open questions, try to explore on top of the answers and clarify doubts.
      Write short sentences with basic english.`,
    );

    return systemMessages.get(dialogueId);
  }

  private findInitialMessage(dialogueId: string): string {
    switch (dialogueId) {
      case '1':
        return 'Hello there! How can I help you?';
      case '2':
        return "Hey friend! It's been so long! How are you?";
      case '3':
        return 'Hello! Welcome to our restaurant! Would you like to order?';
      case '4':
        return 'Hello! My name is John and I will be your interviewer today. How are you?';
      default:
        return 'Hello there! How can I help you?';
    }
  }
}
