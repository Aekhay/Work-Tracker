
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Space, Item } from '../types';
import { FolderIcon, PlusIcon, DocumentTextIcon, SearchIcon, XIcon } from './icons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  spaces: Space[];
  items: Item[];
  onSelectSpace: (spaceId: string) => void;
  onNewSpace: () => void;
  onNewItem: () => void;
  onEditItem: (item: Item) => void;
}

type Command = {
  id: string;
  title: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
};

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, spaces, items, onSelectSpace, onNewSpace, onNewItem, onEditItem }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const commands = useMemo<Command[]>(() => {
    const allCommands: Command[] = [
      {
        id: 'new-item',
        title: 'Create New Item',
        category: 'Actions',
        icon: <PlusIcon className="w-5 h-5" />,
        action: () => {
            onClose();
            onNewItem();
        }
      },
      {
        id: 'new-space',
        title: 'Create New Space',
        category: 'Actions',
        icon: <FolderIcon className="w-5 h-5" />,
        action: () => {
            onClose();
            onNewSpace();
        }
      },
      ...spaces.map(space => ({
        id: `space-${space.id}`,
        title: `Switch to: ${space.name}`,
        category: 'Spaces',
        icon: <FolderIcon className="w-5 h-5" />,
        action: () => {
            onClose();
            onSelectSpace(space.id);
        }
      })),
      ...items.map(item => ({
        id: `item-${item.id}`,
        title: item.title,
        category: 'Items',
        icon: <DocumentTextIcon className="w-5 h-5" />,
        action: () => {
            onClose();
            onSelectSpace(item.spaceId);
            onEditItem(item);
        }
      })),
    ];
    
    if (!query) {
      return allCommands.filter(c => ['Actions', 'Spaces'].includes(c.category));
    }
    
    const lowercasedQuery = query.toLowerCase();
    
    // For performance, create a map of items to avoid repeated `find` calls
    const itemMap = new Map(items.map(item => [`item-${item.id}`, item]));

    return allCommands.filter(command => {
      // For items, search across title, content, and tags
      if (command.category === 'Items') {
        const item = itemMap.get(command.id);
        if (!item) return false;

        return (
          item.title.toLowerCase().includes(lowercasedQuery) ||
          item.content.toLowerCase().includes(lowercasedQuery) ||
          item.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery)) ||
          (Array.isArray(item.subtasks) && item.subtasks.some(subtask => subtask.text.toLowerCase().includes(lowercasedQuery)))
        );
      }
      
      // For other commands, search by title
      return command.title.toLowerCase().includes(lowercasedQuery);
    });

  }, [spaces, items, query, onClose, onNewItem, onNewSpace, onSelectSpace, onEditItem]);

  useEffect(() => {
    if (activeIndex >= commands.length) {
      setActiveIndex(0);
    }
     // Scroll to active item
    if (resultsRef.current && resultsRef.current.children[activeIndex]) {
      resultsRef.current.children[activeIndex].scrollIntoView({
        block: 'nearest',
      });
    }
  }, [activeIndex, commands.length]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % commands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + commands.length) % commands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (commands[activeIndex]) {
        commands[activeIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [activeIndex, commands, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start pt-20 animate-fade-in" onMouseDown={onClose}>
      <div 
        className="bg-surface rounded-lg shadow-xl w-full max-w-2xl transform transition-all"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            placeholder="Search items, switch spaces, or create..."
            className="w-full bg-transparent border-b border-gray-200 text-lg py-4 pl-12 pr-4 focus:outline-none"
          />
           <button onClick={onClose} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
            {commands.length > 0 ? (
                 <ul ref={resultsRef}>
                    {commands.map((command, index) => (
                        <li
                            key={command.id}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={command.action}
                            className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
                                index === activeIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
                            }`}
                        >
                            <div className="flex items-center">
                                <span className="text-gray-500 mr-3">{command.icon}</span>
                                <span className="text-secondary">{command.title}</span>
                            </div>
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md">{command.category}</span>
                        </li>
                    ))}
                 </ul>
            ) : (
                <div className="text-center p-8 text-gray-500">No results found.</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;