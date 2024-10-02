export interface CreateTeamBody {
  nome: string;
  descrizione?: string;
  colore: string;
  utentiIds?: number[];
}

export interface UpdateTeamBody {
  nome: string;
  descrizione?: string;
  colore: string;
  utentiIds: number[];
}

export interface UpdateTeamParams {
  id: number;
}

export interface DeleteTeamParams {
  id: number;
}

export interface GetTeamParams {
  id: number;
}
