export interface NoteModel {
  id: number;
  contenuto: string;
  priorita_id?: number;
  priority?: number;
  reminder_date: Date | null;
  token?: string;
}