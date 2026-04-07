export interface Resume {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  parsed_text: string | null;
  uploaded_at: string;
  updated_at: string;
}
