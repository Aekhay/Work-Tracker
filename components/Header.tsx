
import React from 'react';
import type { Space } from '../types';
import { SearchIcon, MenuIcon } from './icons';

interface HeaderProps {
  spaces: Space[];
  activeSpaceId: string | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ spaces, activeSpaceId, searchTerm, onSearchChange, onToggleSidebar }) => {
  const activeSpace = spaces.find(s => s.id === activeSpaceId);
  const title = activeSpace ? activeSpace.name : 'Dashboard';

  return (
    <header className="bg-surface border-b border-gray-200 p-4 flex justify-between items-center gap-4 flex-shrink-0">
      <div className="flex items-center min-w-0">
        <button onClick={onToggleSidebar} className="md:hidden mr-3 text-gray-500 hover:text-primary" aria-label="Open sidebar">
          <MenuIcon className="w-6 h-6" />
        </button>
        <h1 className="text-xl sm:text-3xl font-bold text-secondary truncate">{title}</h1>
      </div>
      <div className="relative w-full max-w-xs sm:max-w-md">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pr-2 pointer-events-none bg-gray-100 rounded-l-lg border-r border-gray-300">
          <SearchIcon className="w-5 h-5 text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg py-2.5 pl-12 pr-4 sm:pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-flex items-center border border-gray-300 rounded px-2 text-sm font-sans font-medium text-gray-500">
            ⌘K
          </kbd>
        </div>
      </div>
    </header>
  );
};

export default Header;
