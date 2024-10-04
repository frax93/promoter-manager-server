export interface NoteModel {
  id: number;
  contenuto: string;
  priority_id?: number;
  data_creazione: string;
  reminder_date: Date | null;
  token?: string;
  utente_id: string;
}