
import React from 'react';
import type { Item } from '../types';
import { Status } from '../types';
import ItemCard from './ItemCard';
import { PlusIcon, GridViewIcon, ListViewIcon, TrashIcon, TagIcon } from './icons';

interface DashboardProps {
  items: Item[];
  activeSpaceId: string | null;
  statusFilter: Status | 'all';
  onFilterChange: (status: Status | 'all') => void;
  onStatusChange: (itemId: string, newStatus: Status) => void;
  onNewItem: () => void;
  onEditItem: (item: Item) => void;
  onToggleSubtask: (itemId: string, subtaskId: string) => void;
  viewMode: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  isDeleteModeActive: boolean;
  toggleDeleteMode: () => void;
  selectedItemIds: string[];
  onSelectItem: (itemId: string) => void;
  onBulkDelete: () => void;
  allTags: string[];
  activeTagFilter: string | null;
  onTagFilterChange: (tag: string | null) => void;
}

const FilterButton: React.FC<{
  label: string;
  value: Status | 'all';
  activeFilter: Status | 'all';
  onClick: (value: Status | 'all') => void;
}> = ({ label, value, activeFilter, onClick }) => (
  <button
    onClick={() => onClick(value)}
    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
      activeFilter === value
        ? 'bg-primary text-white'
        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`}
  >
    {label}
  </button>
);

const TagFilterButton: React.FC<{
  tag: string | null;
  activeTag: string | null;
  onClick: (tag: string | null) => void;
}> = ({ tag, activeTag, onClick }) => (
  <button
    onClick={() => onClick(tag)}
    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors flex items-center ${
      activeTag === tag
        ? 'bg-accent text-white'
        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
    }`}
  >
    {tag ? `#${tag}` : 'All Tags'}
  </button>
);

const Dashboard: React.FC<DashboardProps> = ({ 
  items, activeSpaceId, statusFilter, onFilterChange, onStatusChange, onNewItem, onEditItem, 
  onToggleSubtask, viewMode, onViewChange, isDeleteModeActive, toggleDeleteMode, selectedItemIds, 
  onSelectItem, onBulkDelete, allTags, activeTagFilter, onTagFilterChange
}) => {
  return (
    <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 min-h-[44px] gap-4">
        {isDeleteModeActive ? (
          <div className="flex flex-col sm:flex-row justify-between items-center w-full animate-fade-in gap-4">
            <span className="text-lg font-semibold text-secondary">{selectedItemIds.length} item(s) selected</span>
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
              <button
                onClick={onBulkDelete}
                disabled={selectedItemIds.length === 0}
                className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed flex-1 sm:flex-none"
              >
                Delete
              </button>
              <button
                onClick={toggleDeleteMode}
                className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors flex-1 sm:flex-none"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600 mr-2 hidden sm:inline">Status:</span>
              <FilterButton label="All" value="all" activeFilter={statusFilter} onClick={onFilterChange} />
              {Object.values(Status).map(status => (
                <FilterButton key={status} label={status} value={status} activeFilter={statusFilter} onClick={onFilterChange} />
              ))}
            </div>
            <div className="flex items-center self-end sm:self-center justify-end flex-wrap gap-2">
              {activeSpaceId && (
                  <button 
                      onClick={onNewItem}
                      className="flex items-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      New Item
                  </button>
              )}
              <div className="flex items-center bg-gray-200 rounded-lg p-1">
                <button 
                  onClick={() => onViewChange('grid')} 
                  className={`p-1 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:bg-gray-300'}`}
                  aria-label="Grid view"
                >
                  <GridViewIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onViewChange('list')}
                  className={`p-1 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:bg-gray-300'}`}
                  aria-label="List view"
                >
                  <ListViewIcon className="w-5 h-5" />
                </button>
              </div>
              <button 
                onClick={toggleDeleteMode}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-red-600 transition-colors"
                aria-label="Delete items"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {!isDeleteModeActive && allTags.length > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-6 border-t pt-4 mt-2">
            <div className="flex items-center text-sm font-medium text-gray-600 mr-2">
                <TagIcon className="w-4 h-4 mr-1"/> Tags:
            </div>
            <TagFilterButton tag={null} activeTag={activeTagFilter} onClick={onTagFilterChange} />
            {allTags.map(tag => (
                <TagFilterButton key={tag} tag={tag} activeTag={activeTagFilter} onClick={onTagFilterChange} />
            ))}
          </div>
      )}

      {items.length > 0 ? (
        <div className={
          viewMode === 'grid'
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "flex flex-col gap-4"
        }>
          {items.map((item) => (
            <ItemCard 
                key={item.id} 
                item={item} 
                onStatusChange={onStatusChange}
                onEdit={onEditItem}
                onToggleSubtask={onToggleSubtask}
                view={viewMode}
                isDeleteModeActive={isDeleteModeActive}
                isSelected={selectedItemIds.includes(item.id)}
                onSelectItem={onSelectItem}
                onTagSelect={onTagFilterChange}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-100 rounded-lg mt-4">
            <h2 className="text-2xl font-semibold text-gray-700">No items found.</h2>
            <p className="text-gray-500 mt-2">Try adjusting your search or filter, or create a new item!</p>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
