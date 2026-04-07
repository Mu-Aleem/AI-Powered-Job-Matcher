import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private supabaseService: SupabaseService) {}

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;
    return data as User;
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as User;
  }

  async create(userData: {
    email: string;
    password_hash: string;
    full_name: string;
    role: string;
  }): Promise<User> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data as User;
  }
}
