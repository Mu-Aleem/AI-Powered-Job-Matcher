import { Module } from '@nestjs/common';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';

@Module({
  providers: [ChunkingService, EmbeddingService],
  exports: [EmbeddingService],
})
export class EmbeddingsModule {}
