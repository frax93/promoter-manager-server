export interface UserModel {
  id: string;
  password: string;
  two_factor_enabled: boolean;
  two_factor_secret: string;
  email: string;
}
  