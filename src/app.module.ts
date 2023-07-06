import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageController } from './message/message.controller';
import { ConfigModule } from '@nestjs/config';
import { MessageService } from './message/message.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, MessageController],
  providers: [AppService, MessageService],
})
export class AppModule {}
