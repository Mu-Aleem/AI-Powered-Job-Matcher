import { Injectable } from '@nestjs/common';
import { SectionType } from './enums/section-type.enum';

interface Chunk {
  section_type: SectionType;
  content: string;
}

const SECTION_PATTERNS: [RegExp, SectionType][] = [
  [
    /^\s*(summary|objective|profile|about\s*me|professional\s+summary)\s*:?\s*$/i,
    SectionType.SUMMARY,
  ],
  [
    /^\s*(skills|technical\s+skills|core\s+competencies|technologies|tools|competencies)\s*:?\s*$/i,
    SectionType.SKILLS,
  ],
  [
    /^\s*(experience|work\s+experience|professional\s+experience|employment(\s+history)?|work\s+history)\s*:?\s*$/i,
    SectionType.EXPERIENCE,
  ],
  [
    /^\s*(education|academic|qualifications|academic\s+background)\s*:?\s*$/i,
    SectionType.EDUCATION,
  ],
  [
    /^\s*(certifications?|licenses?|credentials|awards(\s+and\s+certifications?)?)\s*:?\s*$/i,
    SectionType.CERTIFICATIONS,
  ],
];

@Injectable()
export class ChunkingService {
  chunkResume(parsedText: string): Chunk[] {
    const lines = parsedText.split('\n');
    const chunks: Chunk[] = [];
    let currentType: SectionType = SectionType.SUMMARY;
    let currentContent: string[] = [];

    for (const line of lines) {
      const matchedType = this.matchSectionHeader(line);

      if (matchedType !== null) {
        // Save accumulated content as a chunk
        const content = currentContent.join('\n').trim();
        if (content) {
          chunks.push({ section_type: currentType, content });
        }
        currentType = matchedType;
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }

    // Push final chunk
    const finalContent = currentContent.join('\n').trim();
    if (finalContent) {
      chunks.push({ section_type: currentType, content: finalContent });
    }

    // If no sections were detected, return entire text as OTHER
    if (chunks.length === 0) {
      return [{ section_type: SectionType.OTHER, content: parsedText.trim() }];
    }

    return chunks;
  }

  private matchSectionHeader(line: string): SectionType | null {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length > 60) return null;

    for (const [pattern, type] of SECTION_PATTERNS) {
      if (pattern.test(trimmed)) {
        return type;
      }
    }
    return null;
  }
}
