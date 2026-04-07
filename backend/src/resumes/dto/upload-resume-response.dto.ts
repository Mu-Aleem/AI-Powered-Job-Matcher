export class UploadResumeResponseDto {
  id: string;
  file_name: string;
  file_type: string;
  parsed_text: string | null;
  uploaded_at: string;
}
