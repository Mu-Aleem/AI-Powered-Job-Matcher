import { UserRole } from '../../common/enums/user-role.enum';

export class UserResponseDto {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}
