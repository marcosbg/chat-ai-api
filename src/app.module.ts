import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TranscriptionModule } from './transcription/transcription.module';
import { ChatModule } from './chat/chat.module';
import { GrammarModule } from './grammar/grammar.module';
import { AiProviderModule } from './ai-provider/ai-provider.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TranscriptionModule,
    ChatModule,
    GrammarModule,
    AiProviderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
