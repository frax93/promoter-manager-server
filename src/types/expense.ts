export type CreateExpenseRequestBody = {
  descrizione: string;
  importo: number;
  tipoId?: number;
  guadagno_spesa: boolean;
  tipo_importo: string;
};

export type UpdateExpenseRequestParams = {
  id: string;
};

export type UpdateExpenseRequestBody = {
  descrizione: string;
  importo: number;
  tipoId?: number;
  tipo_importo: string;
};

export type DeleteExpenseRequestParams = {
  id: string;
};
