import { Module } from '@nestjs/common';
import { EmbeddingsModule } from '../embeddings/embeddings.module';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';

@Module({
  imports: [EmbeddingsModule],
  controllers: [MatchingController],
  providers: [MatchingService],
})
export class MatchingModule {}
