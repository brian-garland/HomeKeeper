import { Tables } from '../../types/database.types'
import { TaskRecurrence } from '../../types/preferences'

type Task = Tables<'tasks'> & {
  recurrence?: TaskRecurrence
}

/**
 * Calculate the next due date for a recurring task based on its recurrence settings
 */
export function calculateNextDueDate(
  completedDate: Date,
  recurrence: TaskRecurrence
): Date {
  const nextDate = new Date(completedDate)
  
  // Add the frequency to the completed date
  nextDate.setMonth(nextDate.getMonth() + recurrence.frequency_months)
  
  return nextDate
}

/**
 * Create a recurring task when the original is completed
 */
export function createRecurringTask(
  originalTask: Task,
  completedDate: Date = new Date()
): Task | null {
  // Only create recurring task if recurrence is enabled
  if (!originalTask.recurrence?.enabled) {
    return null
  }

  const nextDueDate = calculateNextDueDate(completedDate, originalTask.recurrence)
  
  // Create new task with same properties but new due date
  const recurringTask: Task = {
    ...originalTask,
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    due_date: nextDueDate.toISOString().split('T')[0],
    status: 'pending',
    completed_at: null,
    completed_by: null,
    auto_generated: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reschedule_count: 0
  }

  return recurringTask
}

/**
 * Handle task completion and create recurring task if needed
 */
export async function handleTaskCompletion(
  task: Task,
  completedDate: Date = new Date()
): Promise<Task | null> {
  // Prevent infinite loops - don't create recurring tasks from auto-generated tasks
  if (task.auto_generated) {
    return null
  }

  return createRecurringTask(task, completedDate)
} 