
import React from 'react';
import type { Space } from '../types';
import { SearchIcon } from './icons';

interface HeaderProps {
  spaces: Space[];
  activeSpaceId: string | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const Header: React.FC<HeaderProps> = ({ spaces, activeSpaceId, searchTerm, onSearchChange }) => {
  const activeSpace = spaces.find(s => s.id === activeSpaceId);
  const title = activeSpace ? activeSpace.name : 'Dashboard';

  return (
    <header className="bg-surface border-b border-gray-200 p-4 flex justify-between items-center">
      <h1 className="text-3xl font-bold text-secondary">{title}</h1>
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search items by title or content..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-gray-100 border border-gray-300 rounded-lg py-2 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <kbd className="inline-flex items-center border border-gray-300 rounded px-2 text-sm font-sans font-medium text-gray-500">
            ⌘K
          </kbd>
        </div>
      </div>
    </header>
  );
};

export default Header;