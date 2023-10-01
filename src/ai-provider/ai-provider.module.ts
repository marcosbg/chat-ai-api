import { Global, Module } from '@nestjs/common';
import { AiProviderService } from './ai-provider.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  providers: [AiProviderService],
  exports: [AiProviderService],
  imports: [ConfigModule],
})
export class AiProviderModule {}
