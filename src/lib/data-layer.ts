import { TaskRecord, ToolId } from './types';

// In-memory / localStorage data layer matching replica-architect schema contracts
const tasksStore = new Map<string, TaskRecord>();

export async function createTask(tool: ToolId, inputFileCount: number): Promise<TaskRecord> {
  const id = crypto.randomUUID();
  const taskToken = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours

  const task: TaskRecord = {
    id,
    taskToken,
    tool,
    status: 'opened',
    inputFileCount,
    outputFileCount: 1,
    downloadFilename: `replica_${tool}_${Date.now()}.pdf`,
    expiresAt,
    createdAt: now.toISOString(),
  };

  tasksStore.set(id, task);
  return task;
}

export async function completeTask(id: string, downloadUrl: string): Promise<TaskRecord> {
  const task = tasksStore.get(id);
  if (!task) throw new Error(`Task ${id} not found`);

  task.status = 'completed';
  task.downloadUrl = downloadUrl;
  tasksStore.set(id, task);
  return task;
}

export async function deleteTask(id: string): Promise<boolean> {
  const task = tasksStore.get(id);
  if (!task) return false;

  task.status = 'deleted';
  task.downloadUrl = undefined;
  tasksStore.set(id, task);
  return true;
}

export async function getTask(id: string): Promise<TaskRecord | null> {
  const task = tasksStore.get(id);
  if (!task || task.status === 'deleted') return null;

  // Check TTL expiration
  if (new Date(task.expiresAt).getTime() < Date.now()) {
    task.status = 'deleted';
    return null;
  }

  return task;
}
