import { User } from "./user";


export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface SignupCredentials extends LoginCredentials {
    username: string;
  }
  
  export interface AuthResponse {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
  };
}
  