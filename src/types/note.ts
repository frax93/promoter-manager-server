export interface CreateNoteBody {
  contenuto: string;
  reminderDate: Date;
  token: string;
  priorita: string;
}

export interface UpdateNoteBody {
  contenuto: string;
  reminderDate: Date;
  token: string;
  priorita: number;
  completed?: boolean;
}

export interface MarkAsCompleteBody {
  completed?: boolean;
}

export interface UpdateNoteParams {
  id: number;
}

export interface DeleteNoteParams {
  id: number;
}

export interface GetNoteParams {
  id: number;
}
