export interface NoteModel {
  id: number;
  contenuto: string;
  priority_id?: number;
  reminder_date: Date | null;
  token?: string;
}