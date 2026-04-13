import { Module } from '@nestjs/common';
import { ChunkingService } from './chunking.service';
import { EmbeddingService } from './embedding.service';
import { LlmService } from './llm.service';

@Module({
  providers: [ChunkingService, EmbeddingService, LlmService],
  exports: [EmbeddingService, ChunkingService, LlmService],
})
export class EmbeddingsModule {}
