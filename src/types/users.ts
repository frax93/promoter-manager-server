// Tipo per la richiesta di recupero di un utente
export interface GetUserParams {
  id: number;
}
// Tipo per la richiesta di aggiornamento di un utente
export interface UpdateUserParams {
  id: number;
}

export interface UpdateUserBody {
  referralLink?: string;
  linkAzienda?: string;
  linkVideo?: string;
}

export interface AvailabilityBody {
  emails?: string[];
  token: string;
}

// Tipo per la richiesta di cambio password
export interface ChangePasswordBody {
  password: string;
}
