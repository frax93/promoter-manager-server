export interface NoteModel {
  id: number;
  contenuto: string;
  priorita_id?: number;
  reminder_date: Date | null;
  token?: string;
}