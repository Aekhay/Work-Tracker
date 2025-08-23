import React, { useState, useMemo, useEffect } from 'react';
import type { Space, Item } from './types';
import { Status } from './types';
import { INITIAL_SPACES, INITIAL_ITEMS } from './constants';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Modal from './components/Modal';
import CommandPalette from './components/CommandPalette';

const App: React.FC = () => {
  const [spaces, setSpaces] = useState<Space[]>(() => {
    try {
      const saved = localStorage.getItem('work-tracker-spaces');
      return saved ? JSON.parse(saved) : INITIAL_SPACES;
    } catch {
      return INITIAL_SPACES;
    }
  });
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const saved = localStorage.getItem('work-tracker-items');
      return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    } catch {
      return INITIAL_ITEMS;
    }
  });
  
  useEffect(() => {
    localStorage.setItem('work-tracker-spaces', JSON.stringify(spaces));
  }, [spaces]);
  
  useEffect(() => {
    localStorage.setItem('work-tracker-items', JSON.stringify(items));
  }, [items]);
  
  const [activeSpaceId, setActiveSpaceId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [isDeleteModeActive, setIsDeleteModeActive] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
            event.preventDefault();
            setIsCommandPaletteOpen(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  type ModalType = 'none' | 'newSpace' | 'newItem' | 'editItem' | 'confirmDelete' | 'confirmDeleteSpace';
  const [modal, setModal] = useState<ModalType>('none');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [spaceToDelete, setSpaceToDelete] = useState<string | null>(null);

  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  const [newItemTags, setNewItemTags] = useState('');
  const [newSpaceName, setNewSpaceName] = useState('');

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach(item => item.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [items]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term) {
      // Entering a search term triggers a global search, resetting context
      setActiveSpaceId(null);
      setStatusFilter('all');
      setTagFilter(null);
    }
  };

  const filteredItems = useMemo(() => {
    let results = items;

    // Global search takes precedence and searches across title, content, and tags
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      results = items.filter(item => 
        item.title.toLowerCase().includes(lowercasedTerm) ||
        item.content.toLowerCase().includes(lowercasedTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm))
      );
    } else {
      // Apply contextual filters only when not searching
      results = items.filter(item => {
        if (activeSpaceId && item.spaceId !== activeSpaceId) return false;
        if (statusFilter !== 'all' && item.status !== statusFilter) return false;
        if (tagFilter && !item.tags.includes(tagFilter)) return false;
        return true;
      });
    }

    return results.sort((a, b) => b.createdAt - a.createdAt);
  }, [items, activeSpaceId, statusFilter, searchTerm, tagFilter]);

  const handleUpdateItemStatus = (itemId: string, newStatus: Status) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );
  };
  
  const toggleDeleteMode = () => {
    setIsDeleteModeActive(prev => !prev);
    setSelectedItemIds([]);
  };
  
  const handleSelectItem = (itemId: string) => {
    setSelectedItemIds(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleConfirmBulkDelete = () => {
    setItems(prev => prev.filter(item => !selectedItemIds.includes(item.id)));
    handleCloseModal();
    setIsDeleteModeActive(false);
    setSelectedItemIds([]);
  };

  const handleCloseModal = () => {
    setModal('none');
    setEditingItem(null);
    setNewItemTitle('');
    setNewItemContent('');
    setNewItemTags('');
    setNewSpaceName('');
    setSpaceToDelete(null);
  };
  
  const handleCreateSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSpaceName.trim()) {
      const newSpace: Space = {
        id: `space-${Date.now()}`,
        name: newSpaceName.trim(),
        createdAt: Date.now(),
      };
      setSpaces(prev => [...prev, newSpace]);
      setActiveSpaceId(newSpace.id);
      handleCloseModal();
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemTitle.trim() && activeSpaceId) {
       const newItem: Item = {
        id: `item-${Date.now()}`,
        spaceId: activeSpaceId,
        title: newItemTitle.trim(),
        content: newItemContent.trim(),
        status: Status.ToDo,
        createdAt: Date.now(),
        tags: newItemTags.split(',').map(t => t.trim()).filter(Boolean),
      };
      setItems(prev => [newItem, ...prev]);
      handleCloseModal();
    }
  };

  const handleOpenEditModal = (item: Item) => {
    setEditingItem(item);
    setNewItemTitle(item.title);
    setNewItemContent(item.content);
    setNewItemTags(item.tags.join(', '));
    setModal('editItem');
  };
  
  const handleOpenDeleteSpaceModal = (spaceId: string) => {
    setSpaceToDelete(spaceId);
    setModal('confirmDeleteSpace');
  };

  const handleConfirmSpaceDelete = () => {
    if (!spaceToDelete) return;

    setSpaces(prev => prev.filter(s => s.id !== spaceToDelete));
    setItems(prev => prev.filter(i => i.spaceId !== spaceToDelete));

    if (activeSpaceId === spaceToDelete) {
      setActiveSpaceId(null);
    }
    
    handleCloseModal();
  };

  const handleUpdateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemTitle.trim() && editingItem) {
      setItems(prevItems =>
        prevItems.map(item =>
          item.id === editingItem.id
            ? { 
                ...item, 
                title: newItemTitle.trim(), 
                content: newItemContent.trim(),
                tags: newItemTags.split(',').map(t => t.trim()).filter(Boolean),
              }
            : item
        )
      );
      handleCloseModal();
    }
  };
  
  const renderModalContent = () => {
    if (modal === 'newSpace') {
      return (
        <form onSubmit={handleCreateSpace}>
          <label htmlFor="spaceName" className="block text-sm font-medium text-gray-700 mb-1">Space Name</label>
          <input
            id="spaceName" type="text" value={newSpaceName} onChange={e => setNewSpaceName(e.target.value)}
            className="w-full bg-secondary border border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
            placeholder="e.g. Project Phoenix" autoFocus
          />
          <button type="submit" className="w-full mt-4 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Create Space
          </button>
        </form>
      );
    }
    if (modal === 'newItem' || modal === 'editItem') {
        const isEditing = modal === 'editItem';
        return (
            <form onSubmit={isEditing ? handleUpdateItem : handleCreateItem}>
                <div className="mb-4">
                    <label htmlFor="itemTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input id="itemTitle" type="text" value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)}
                        className="w-full bg-secondary border border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                        placeholder="e.g. Design new homepage" autoFocus/>
                </div>
                <div className="mb-4">
                    <label htmlFor="itemContent" className="block text-sm font-medium text-gray-700 mb-1">Content (or Link)</label>
                    <textarea id="itemContent" value={newItemContent} onChange={e => setNewItemContent(e.target.value)}
                        className="w-full bg-secondary border border-gray-600 rounded-lg p-2 h-24 focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                        placeholder="Add details, notes, or a URL..."/>
                </div>
                <div>
                    <label htmlFor="itemTags" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <input id="itemTags" type="text" value={newItemTags} onChange={e => setNewItemTags(e.target.value)}
                        className="w-full bg-secondary border border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary text-white placeholder-gray-400"
                        placeholder="e.g. dev, planning, urgent"/>
                    <p className="text-xs text-gray-500 mt-1">Separate tags with a comma.</p>
                </div>
                <button type="submit" className="w-full mt-4 bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    {isEditing ? 'Save Changes' : 'Create Item'}
                </button>
            </form>
      );
    }
    if (modal === 'confirmDelete') {
      const itemsToDelete = items.filter(item => selectedItemIds.includes(item.id));
      return (
        <div>
          <p className="text-gray-700">Are you sure you want to permanently delete these {itemsToDelete.length} items?</p>
          <ul className="my-4 max-h-48 overflow-y-auto list-disc list-inside bg-gray-100 p-3 rounded-lg border">
            {itemsToDelete.map(item => (
              <li key={item.id} className="truncate text-sm text-gray-600">{item.title}</li>
            ))}
          </ul>
          <div className="flex justify-end space-x-3 mt-6">
            <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300">
              Cancel
            </button>
            <button onClick={handleConfirmBulkDelete} className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-red-600 text-white hover:bg-red-700">
              Delete Items
            </button>
          </div>
        </div>
      );
    }
    if (modal === 'confirmDeleteSpace') {
      const space = spaces.find(s => s.id === spaceToDelete);
      return (
        <div>
          <p className="text-gray-700 mb-2">Are you sure you want to permanently delete the space <strong className="font-semibold">{space?.name}</strong>?</p>
          <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg border border-red-200">This will also delete all items within this space. This action cannot be undone.</p>
          <div className="flex justify-end space-x-3 mt-6">
            <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300">
              Cancel
            </button>
            <button onClick={handleConfirmSpaceDelete} className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-red-600 text-white hover:bg-red-700">
              Delete Space
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-screen w-screen flex bg-background text-secondary font-sans">
      <Sidebar
        spaces={spaces}
        activeSpaceId={activeSpaceId}
        onSelectSpace={setActiveSpaceId}
        onNewSpace={() => setModal('newSpace')}
        onDeleteSpace={handleOpenDeleteSpaceModal}
      />
      <div className="flex-1 flex flex-col">
        <Header
          spaces={spaces}
          activeSpaceId={activeSpaceId}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        <Dashboard
          items={filteredItems}
          activeSpaceId={activeSpaceId}
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
          onStatusChange={handleUpdateItemStatus}
          onNewItem={() => setModal('newItem')}
          onEditItem={handleOpenEditModal}
          viewMode={viewMode}
          onViewChange={setViewMode}
          isDeleteModeActive={isDeleteModeActive}
          toggleDeleteMode={toggleDeleteMode}
          selectedItemIds={selectedItemIds}
          onSelectItem={handleSelectItem}
          onBulkDelete={() => { if (selectedItemIds.length > 0) setModal('confirmDelete'); }}
          allTags={allTags}
          activeTagFilter={tagFilter}
          onTagFilterChange={setTagFilter}
        />
      </div>
      <Modal 
        isOpen={modal !== 'none'}
        onClose={handleCloseModal}
        title={
            modal === 'newSpace' ? 'Create a New Space' :
            modal === 'editItem' ? 'Edit Item' : 
            modal === 'confirmDelete' ? 'Confirm Deletion' : 
            modal === 'confirmDeleteSpace' ? 'Confirm Space Deletion' : 
            'Create a New Item'
        }
      >
        {renderModalContent()}
      </Modal>
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        spaces={spaces}
        items={items}
        onSelectSpace={setActiveSpaceId}
        onNewSpace={() => setModal('newSpace')}
        onNewItem={() => { if(activeSpaceId) { setModal('newItem') } else { alert("Please select a space first.")} }}
        onEditItem={handleOpenEditModal}
      />
    </div>
  );
};

export default App;
