import { Module } from '@nestjs/common';
import { TranscriptionService } from './transcription.service';
import { TranscriptionController } from './transcription.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [TranscriptionController],
  providers: [TranscriptionService],
  imports: [ConfigModule],
})
export class TranscriptionModule {}
