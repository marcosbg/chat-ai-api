import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { GrammarService } from './grammar.service';
import GrammarResponse from './interfaces/grammarResponse';

@Controller('v1/grammar')
export class GrammarController {
  private readonly logger = new Logger(GrammarController.name);

  constructor(private readonly grammarService: GrammarService) {}

  @Post()
  @HttpCode(200)
  async convertStandardGrammar(
    @Body('text') text: string,
  ): Promise<GrammarResponse> {
    this.logger.log('Receiving text to convert into standar grammar: ' + text);
    return this.grammarService.convertToGrammar(text);
  }
}
