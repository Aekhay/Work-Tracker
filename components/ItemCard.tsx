import React, { useState, useRef, useEffect } from 'react';
import type { Item, Subtask } from '../types';
import { Status } from '../types';
import { STATUS_COLORS } from '../constants';
import { CheckCircleIcon, ChevronDownIcon, PencilIcon, ClipboardCopyIcon, CheckIcon, CalendarIcon } from './icons';

interface ItemCardProps {
  item: Item;
  onStatusChange: (itemId: string, newStatus: Status) => void;
  onEdit: (item: Item) => void;
  onToggleSubtask: (itemId: string, subtaskId: string) => void;
  view: 'grid' | 'list';
  isDeleteModeActive: boolean;
  isSelected: boolean;
  onSelectItem: (itemId: string) => void;
  onTagSelect: (tag: string) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onStatusChange, onEdit, onToggleSubtask, view, isDeleteModeActive, isSelected, onSelectItem, onTagSelect }) => {
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
      if ((e.target as HTMLElement).closest('button, a, input, label')) {
        return;
      }
      onSelectItem(item.id);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const urlToCopy = item.content;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLink = item.content.trim().startsWith('http');
  
  const formatDate = (dateValue: string | number) => {
    let date: Date;
    if (typeof dateValue === 'string') {
      const parts = dateValue.split('-');
      if (parts.length === 3) {
        date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        date = new Date(dateValue);
      }
    } else {
      date = new Date(dateValue);
    }
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const baseCardClasses = 'bg-surface rounded-lg shadow-md border hover:shadow-lg transition-all duration-300 animate-fade-in';
  const selectionClasses = isDeleteModeActive 
    ? `cursor-pointer ${isSelected ? 'border-primary ring-2 ring-primary' : 'border-gray-200'}` 
    : 'border-gray-200';

  const SubtaskDisplay = () => {
    if (!Array.isArray(item.subtasks) || item.subtasks.length === 0) return null;
    const completedCount = item.subtasks.filter(t => t.completed).length;
    const totalCount = item.subtasks.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
      <div className="mt-4 border-t pt-3">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">Checklist</h4>
          <span className="text-xs font-semibold text-gray-500">{completedCount}/{totalCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
          <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="space-y-2 max-h-28 overflow-y-auto pr-1">
          {item.subtasks.map(subtask => (
            <div key={subtask.id} className="flex items-center">
              <input
                type="checkbox"
                id={`${item.id}-${subtask.id}`}
                checked={subtask.completed}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSubtask(item.id, subtask.id);
                }}
                className="custom-checkbox w-4 h-4 rounded-lg"
              />
              <label htmlFor={`${item.id}-${subtask.id}`} className={`ml-2 text-sm ${subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                {subtask.text}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TagsDisplay = () => (
    item.tags && item.tags.length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
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
          className={`${baseCardClasses} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${selectionClasses}`}
          onClick={handleCardClick}
        >
            <div className="flex items-start w-full">
                {isDeleteModeActive && (
                <div className="mr-4 flex-shrink-0 pt-1">
                    <input type="checkbox" checked={isSelected} onChange={() => onSelectItem(item.id)} className="custom-checkbox h-5 w-5 rounded-lg" />
                </div>
                )}
                <div className="flex-grow mr-0 sm:mr-4 overflow-hidden">
                    <h3 className="text-lg font-bold text-secondary truncate">{item.title}</h3>
                    <p className="text-sm text-gray-500 truncate whitespace-pre-wrap">
                    {item.content}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto sm:space-x-4 flex-shrink-0">
                {item.dueDate && (
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full flex items-center border border-orange-200">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {formatDate(item.dueDate)}
                    </span>
                )}
                <span className="text-xs text-gray-400">
                    {formatDate(item.createdAt)}
                </span>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={(e) => {e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen)}}
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
                                        onClick={(e) => {e.stopPropagation(); handleStatusChange(status)}}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={(e) => {e.stopPropagation(); onEdit(item)}}
                        className="text-gray-400 hover:text-primary transition-colors"
                        aria-label={`Edit item: ${item.title}`}
                    >
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    {isLink && (
                    <button 
                        onClick={handleCopyLink}
                        className="text-gray-500 hover:text-primary transition-opacity"
                        aria-label="Copy link"
                    >
                        {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardCopyIcon className="w-5 h-5" />}
                    </button>
                    )}
                </div>
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
            <input type="checkbox" checked={isSelected} onChange={() => onSelectItem(item.id)} className="custom-checkbox h-5 w-5 rounded-lg" />
        </div>
      )}
      <div className="flex-grow">
        <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-secondary mb-2 pr-2">{item.title}</h3>
            {isLink && (
                 <button 
                    onClick={handleCopyLink} 
                    className="text-gray-500 hover:text-primary flex-shrink-0"
                    aria-label="Copy link"
                >
                    {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ClipboardCopyIcon className="w-5 h-5" />}
                </button>
            )}
        </div>
        <p className="text-gray-600 mb-4 break-words whitespace-pre-wrap">
          {item.content}
        </p>
      </div>
      
      <div className="flex-shrink-0">
        <SubtaskDisplay />
        <TagsDisplay />

        <div className="flex justify-between items-center mt-4">
            <div className="relative" ref={dropdownRef}>
            <button
                onClick={(e) => {e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen)}}
                className={`flex items-center text-sm font-semibold px-3 py-1 rounded-full transition-colors ${STATUS_COLORS[item.status]}`}
            >
                {item.status === Status.Completed && <CheckCircleIcon className="w-4 h-4 mr-1" />}
                {item.status}
                <ChevronDownIcon className="ml-1 w-4 h-4" />
            </button>
            {isDropdownOpen && (
                <div className="absolute bottom-full right-0 sm:right-auto sm:left-0 mb-2 w-40 bg-white rounded-md shadow-lg border z-10">
                {Object.values(Status).map((status) => (
                    <button
                    key={status}
                    onClick={(e) => {e.stopPropagation(); handleStatusChange(status)}}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                    {status}
                    </button>
                ))}
                </div>
            )}
            </div>
            <div className="flex items-center space-x-3">
                {item.dueDate && (
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full flex items-center border border-orange-200">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {formatDate(item.dueDate)}
                    </span>
                )}
                <span className="text-xs text-gray-400">
                    {formatDate(item.createdAt)}
                </span>
                <button
                    onClick={(e) => {e.stopPropagation(); onEdit(item)}}
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