import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatController } from './chat/chat.controller';
import { ConfigModule } from '@nestjs/config';
import { ChatService } from './chat/chat.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, ChatController],
  providers: [AppService, ChatService],
})
export class AppModule {}
