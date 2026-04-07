import { UserRole } from '../../common/enums/user-role.enum';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}
