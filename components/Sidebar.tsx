import React from 'react';
import type { Space } from '../types';
import { FolderIcon, PlusIcon, DocumentTextIcon, TrashIcon } from './icons';

interface SidebarProps {
  spaces: Space[];
  activeSpaceId: string | null;
  onSelectSpace: (id: string | null) => void;
  onNewSpace: () => void;
  onDeleteSpace: (spaceId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ spaces, activeSpaceId, onSelectSpace, onNewSpace, onDeleteSpace }) => {
  return (
    <aside className="w-64 bg-surface border-r border-gray-200 p-4 flex flex-col">
      <div className="flex items-center mb-8">
        <DocumentTextIcon className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-secondary ml-2">Work Tracker</h1>
      </div>

      <nav className="flex-grow">
        <button
          onClick={() => onSelectSpace(null)}
          className={`w-full flex items-center px-4 py-2 text-left text-lg font-medium rounded-lg transition-colors ${
            activeSpaceId === null
              ? 'bg-blue-100 text-primary'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Dashboard
        </button>
        <h2 className="mt-6 mb-2 text-sm font-semibold text-gray-500 uppercase tracking-wider px-4">Spaces</h2>
        <ul>
          {spaces.map((space) => (
            <li key={space.id} className="relative group">
              <button
                onClick={() => onSelectSpace(space.id)}
                className={`w-full flex items-center px-4 py-2 text-left rounded-lg transition-colors ${
                  activeSpaceId === space.id
                    ? 'bg-blue-100 text-primary font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FolderIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="truncate pr-8">{space.name}</span>
              </button>
              <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSpace(space.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  aria-label={`Delete space: ${space.name}`}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
            </li>
          ))}
        </ul>
      </nav>

      <button
        onClick={onNewSpace}
        className="flex items-center justify-center w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        New Space
      </button>
    </aside>
  );
};

export default Sidebar;