import { Space, Item, Status } from './types';

export const STATUS_COLORS: { [key in Status]: string } = {
  [Status.ToDo]: 'bg-gray-200 text-gray-800',
  [Status.InProgress]: 'bg-blue-200 text-blue-800',
  [Status.Completed]: 'bg-green-200 text-green-800',
};

// All initial data has been removed for a clean user start.
export const INITIAL_SPACES: Space[] = [];

export const INITIAL_ITEMS: Item[] = [];
