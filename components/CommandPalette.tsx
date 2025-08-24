
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
        title: `Go to: ${space.name}`,
        category: 'Spaces',
        icon: <FolderIcon className="w-5 h-5" />,
        action: () => {
            onClose();
            onSelectSpace(space.id);
        }
      })),
      ...items.map(item => ({
        id: `item-${item.id}`,
        title: `Edit: ${item.title}`,
        category: 'Items',
        icon: <DocumentTextIcon className="w-5 h-5" />,
        action: () => {
            onClose();
            // Do not switch space automatically, just open edit modal
            onEditItem(item);
        }
      })),
    ];
    
    if (!query) {
      return allCommands.filter(c => ['Actions', 'Spaces'].includes(c.category));
    }
    
    const lowercasedQuery = query.toLowerCase();
    
    const itemMap = new Map(items.map(item => [`item-${item.id}`, item]));

    return allCommands.filter(command => {
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
      
      return command.title.toLowerCase().includes(lowercasedQuery);
    });

  }, [spaces, items, query, onClose, onNewItem, onNewSpace, onSelectSpace, onEditItem]);

  useEffect(() => {
    if (activeIndex >= commands.length) {
      setActiveIndex(0);
    }
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
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start pt-20 p-4 animate-fade-in" onMouseDown={onClose}>
      <div 
        className="bg-surface rounded-lg shadow-xl w-full max-w-2xl transform transition-all"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="p-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pr-2 pointer-events-none bg-gray-100 rounded-l-lg border-r border-gray-300">
                <SearchIcon className="w-5 h-5 text-gray-500" />
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
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-primary text-base"
            />
            <button onClick={onClose} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                <XIcon className="w-6 h-6" />
            </button>
          </div>
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
                            <div className="flex items-center min-w-0">
                                <span className="text-gray-500 mr-3 flex-shrink-0">{command.icon}</span>
                                <span className="text-secondary truncate">{command.title}</span>
                            </div>
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md flex-shrink-0 ml-2">{command.category}</span>
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
