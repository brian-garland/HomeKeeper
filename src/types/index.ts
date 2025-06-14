import type { Database } from './database.types';
import { TaskRecurrence } from './preferences';

// Base database types
export type Home = Database['public']['Tables']['homes']['Row'];
export type Equipment = Database['public']['Tables']['equipment']['Row'];
export type TaskTemplate = Database['public']['Tables']['task_templates']['Row'];

// Extended Task type with additional fields for local-first functionality
export type Task = Database['public']['Tables']['tasks']['Row'] & {
  recurrence?: TaskRecurrence | null;
  money_saved_estimate?: number | null;
};

// Insert types
export type HomeInsert = Database['public']['Tables']['homes']['Insert'];
export type EquipmentInsert = Database['public']['Tables']['equipment']['Insert'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'] & {
  recurrence?: TaskRecurrence | null;
  money_saved_estimate?: number | null;
};
export type TaskTemplateInsert = Database['public']['Tables']['task_templates']['Insert'];

// Update types
export type HomeUpdate = Database['public']['Tables']['homes']['Update'];
export type EquipmentUpdate = Database['public']['Tables']['equipment']['Update'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'] & {
  recurrence?: TaskRecurrence | null;
  money_saved_estimate?: number | null;
};
export type TaskTemplateUpdate = Database['public']['Tables']['task_templates']['Update']; 