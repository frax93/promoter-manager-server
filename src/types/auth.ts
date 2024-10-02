export interface RegistrationBody {
  nome: string;
  email: string;
  password: string;
  token?: string;
}

export interface LoginBody {
  email: string;
  password: string;
  token2FA?: string;
}

export interface VerificaUtenzaBody {
  email: string;
  password: string;
}

export interface ResetPasswordBody {
  email: string;
}
