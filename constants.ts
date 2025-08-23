
import { Space, Item, Status } from './types';

export const STATUS_COLORS: { [key in Status]: string } = {
  [Status.ToDo]: 'bg-gray-200 text-gray-800',
  [Status.InProgress]: 'bg-blue-200 text-blue-800',
  [Status.Completed]: 'bg-green-200 text-green-800',
};

export const INITIAL_SPACES: Space[] = [
  { id: 'space-1', name: 'Work Items', createdAt: Date.now() - 200000 },
  { id: 'space-2', name: 'Holidays Planned', createdAt: Date.now() - 100000 },
  { id: 'space-3', name: 'Important Links', createdAt: Date.now() },
];

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'item-1',
    spaceId: 'space-1',
    title: 'Work Item Week 1',
    content: 'Plan and execute the first week\'s tasks. Focus on setting up the project environment.',
    status: Status.Completed,
    createdAt: Date.now() - 180000,
    tags: ['planning', 'setup'],
  },
  {
    id: 'item-2',
    spaceId: 'space-1',
    title: 'Work Item Week 2',
    content: 'Develop core features and write unit tests.',
    status: Status.InProgress,
    createdAt: Date.now() - 170000,
    tags: ['dev', 'core-feature'],
  },
    {
    id: 'item-3',
    spaceId: 'space-1',
    title: 'Work Item Week 3',
    content: 'Deploy to staging and start QA testing.',
    status: Status.ToDo,
    createdAt: Date.now() - 160000,
    tags: ['qa', 'deployment'],
  },
  {
    id: 'item-4',
    spaceId: 'space-2',
    title: 'Book Flights to Hawaii',
    content: 'Find the best deals on flights for the December trip.',
    status: Status.ToDo,
    createdAt: Date.now() - 90000,
    tags: ['travel', 'vacation'],
  },
  {
    id: 'item-5',
    spaceId: 'space-3',
    title: 'React Documentation',
    content: 'https://react.dev/',
    status: Status.Completed,
    createdAt: Date.now() - 10000,
    tags: ['react', 'docs', 'frontend'],
  },
    {
    id: 'item-6',
    spaceId: 'space-3',
    title: 'Tailwind CSS Docs',
    content: 'https://tailwindcss.com/docs/installation',
    status: Status.Completed,
    createdAt: Date.now() - 5000,
    tags: ['css', 'docs', 'frontend'],
  },
];