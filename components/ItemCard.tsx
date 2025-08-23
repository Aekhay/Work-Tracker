import React, { useState, useRef, useEffect } from 'react';
import type { Item } from '../types';
import { Status } from '../types';
import { STATUS_COLORS } from '../constants';
import { CheckCircleIcon, ChevronDownIcon, PencilIcon, ClipboardCopyIcon, CheckIcon } from './icons';

interface ItemCardProps {
  item: Item;
  onStatusChange: (itemId: string, newStatus: Status) => void;
  onEdit: (item: Item) => void;
  view: 'grid' | 'list';
  isDeleteModeActive: boolean;
  isSelected: boolean;
  onSelectItem: (itemId: string) => void;
  onTagSelect: (tag: string) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onStatusChange, onEdit, view, isDeleteModeActive, isSelected, onSelectItem, onTagSelect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);


  const handleStatusChange = (newStatus: Status) => {
    onStatusChange(item.id, newStatus);
    setIsDropdownOpen(false);
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    if (isDeleteModeActive) {
      if ((e.target as HTMLElement).closest('button, a')) {
        return;
      }
      onSelectItem(item.id);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLink = item.content.startsWith('http');
  
  const baseCardClasses = 'bg-surface rounded-lg shadow-md border hover:shadow-lg transition-all duration-300 animate-fade-in';
  const selectionClasses = isDeleteModeActive 
    ? `cursor-pointer ${isSelected ? 'border-primary ring-2 ring-primary' : 'border-gray-200'}` 
    : 'border-gray-200';
  
  const TagsDisplay = () => (
    item.tags && item.tags.length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
        {item.tags.map(tag => (
          <button
            key={tag}
            onClick={(e) => { e.stopPropagation(); onTagSelect(tag); }}
            className="text-xs bg-accent bg-opacity-20 text-blue-700 font-semibold px-2.5 py-1 rounded-full hover:bg-opacity-30 transition-colors"
          >
            #{tag}
          </button>
        ))}
      </div>
    ) : null
  );

  if (view === 'list') {
    return (
        <div 
          className={`${baseCardClasses} p-4 flex items-center justify-between ${selectionClasses}`}
          onClick={handleCardClick}
        >
            {isDeleteModeActive && (
              <div className="mr-4 flex-shrink-0">
                  <input type="checkbox" checked={isSelected} readOnly className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
              </div>
            )}
            <div className="flex-grow mr-4 overflow-hidden">
                <h3 className="text-lg font-bold text-secondary truncate">{item.title}</h3>
                {isLink ? (
                    <div className="flex items-center group">
                        <a href={item.content} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline truncate block">
                            {item.content}
                        </a>
                        <button 
                            onClick={handleCopyLink}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-primary flex-shrink-0"
                            aria-label="Copy link"
                        >
                            {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <ClipboardCopyIcon className="w-4 h-4" />}
                        </button>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 truncate">{item.content}</p>
                )}
            </div>

            <div className="flex items-center space-x-4 flex-shrink-0">
                <span className="text-xs text-gray-400 hidden sm:block">
                    {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`flex items-center text-sm font-semibold px-3 py-1 rounded-full transition-colors ${STATUS_COLORS[item.status]}`}
                    >
                        {item.status}
                        <ChevronDownIcon className="ml-1 w-4 h-4" />
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-md shadow-lg border z-10">
                            {Object.values(Status).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={() => onEdit(item)}
                    className="text-gray-400 hover:text-primary transition-colors"
                    aria-label={`Edit item: ${item.title}`}
                >
                    <PencilIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
  }

  // Grid View (default)
  return (
    <div 
      className={`relative ${baseCardClasses} p-5 flex flex-col justify-between ${selectionClasses}`}
      onClick={handleCardClick}
    >
      {isDeleteModeActive && (
        <div className="absolute top-3 right-3 z-10">
            <input type="checkbox" checked={isSelected} readOnly className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
        </div>
      )}
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-secondary mb-2">{item.title}</h3>
        {isLink ? (
           <div className="flex items-start justify-between group">
                <a href={item.content} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all pr-2">
                    {item.content}
                </a>
                <button 
                    onClick={handleCopyLink} 
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-primary flex-shrink-0"
                    aria-label="Copy link"
                >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardCopyIcon className="w-5 h-5" />}
                </button>
            </div>
        ) : (
          <p className="text-gray-600 mb-4 break-words">{item.content}</p>
        )}
      </div>
      
      <div className="flex-shrink-0">
        <TagsDisplay />

        <div className="flex justify-between items-center mt-4">
            <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center text-sm font-semibold px-3 py-1 rounded-full transition-colors ${STATUS_COLORS[item.status]}`}
            >
                {item.status === Status.Completed && <CheckCircleIcon className="w-4 h-4 mr-1" />}
                {item.status}
                <ChevronDownIcon className="ml-1 w-4 h-4" />
            </button>
            {isDropdownOpen && (
                <div className="absolute bottom-full mb-2 w-40 bg-white rounded-md shadow-lg border z-10">
                {Object.values(Status).map((status) => (
                    <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                    {status}
                    </button>
                ))}
                </div>
            )}
            </div>
            <div className="flex items-center space-x-3">
                <span className="text-xs text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <button
                    onClick={() => onEdit(item)}
                    className="text-gray-400 hover:text-primary transition-colors"
                    aria-label={`Edit item: ${item.title}`}
                >
                    <PencilIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;