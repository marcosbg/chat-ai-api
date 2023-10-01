import { Module } from '@nestjs/common';
import { GrammarService } from './grammar.service';
import { GrammarController } from './grammar.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [GrammarController],
  providers: [GrammarService],
  imports: [ConfigModule],
})
export class GrammarModule {}
