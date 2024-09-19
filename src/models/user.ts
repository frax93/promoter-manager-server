export interface UserModel {
  id: string;
  password: string;
  nome: string;
  two_factor_enabled: boolean;
  two_factor_secret: string;
  email: string;
  referrallink?: string;
  linkvideo?: string;
  linkazienda?: string;
  token_verifica: string;
  scadenza_token: string;
  email_confermata: boolean;
}
  