
export enum Status {
  ToDo = 'To-Do',
  InProgress = 'In Progress',
  Completed = 'Completed',
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Item {
  id: string;
  spaceId: string;
  title: string;
  content: string;
  status: Status;
  createdAt: number;
  tags: string[];
  subtasks?: Subtask[];
  dueDate?: string;
}

export interface Space {
  id: string;
  name: string;
  createdAt: number;
}