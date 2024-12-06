import { api } from './axiosConfig';
import { AuthResponse } from '../types/interfaces';

export const login = async (email: string, password: string): Promise<AuthResponse>=> {
  try {
    const response = await api.post<AuthResponse>('/auth/login', { 
      email, 
      password 
    });

    return response.data

  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (
  username: string, 
  email: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', { 
      username, 
      email, 
      password 
    });
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
  } catch (error) {
    throw error;
  }
};