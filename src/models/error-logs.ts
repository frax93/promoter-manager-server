export interface ErrorLogModel {
  id: number;
  error_message: string;
  stack_trace?: string;
  app_context?: object; // JSONB può essere mappato come oggetto
  user_id?: number | null;
  user_agent?: string;
  platform?: string;
  app_version?: string;
  timestamp?: Date;
  severity_level?: string;
}
