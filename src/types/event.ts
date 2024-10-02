// Tipi delle richieste
export interface CreateEventRequestBody {
  titolo: string;
  descrizione?: string;
  data_inizio: string;
  data_fine: string;
  teamId?: number;
}

export type UpdateEventRequestParams = {
  id: string;
};

export interface UpdateEventRequestBody {
  titolo: string;
  descrizione: string;
  data_inizio: Date;
  data_fine: Date;
  nota: string;
}

export interface DeleteEventRequestParams {
  id: string;
}

export interface GetEventExpensesRequestParams {
  id: string;
}
