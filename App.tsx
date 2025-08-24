
import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Space, Item, Subtask } from './types';
import { Status } from './types';
import { INITIAL_SPACES, INITIAL_ITEMS } from './constants';
import { DownloadIcon, UploadIcon, XIcon, FolderIcon, DocumentTextIcon, TagIcon, PlusIcon } from './components/icons';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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

  type ModalType = 'none' | 'newSpace' | 'newItem' | 'editItem' | 'confirmDelete' | 'confirmDeleteSpace' | 'settings';
  const [modal, setModal] = useState<ModalType>('none');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [spaceToDelete, setSpaceToDelete] = useState<string | null>(null);
  const [modalContextSpaceId, setModalContextSpaceId] = useState<string | null>(null);

  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemContent, setNewItemContent] = useState('');
  const [newItemTags, setNewItemTags] = useState('');
  const [newItemSubtasks, setNewItemSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [newSpaceName, setNewSpaceName] = useState('');
  
  const importFileRef = useRef<HTMLInputElement>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach(item => item.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [items]);

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (term) {
      setActiveSpaceId(null);
      setStatusFilter('all');
      setTagFilter(null);
    }
  };
  
  const handleSelectSpace = (spaceId: string | null) => {
    setActiveSpaceId(spaceId);
    setSearchTerm(''); // Clear search when selecting a space
    setIsSidebarOpen(false);
  };
  
  const handleOpenNewSpaceModal = () => {
    setModal('newSpace');
    setIsSidebarOpen(false);
  };

  const handleOpenSettingsModal = () => {
    setModal('settings');
    setIsSidebarOpen(false);
  };

  const filteredItems = useMemo(() => {
    let results = items;

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      results = items.filter(item => 
        item.title.toLowerCase().includes(lowercasedTerm) ||
        item.content.toLowerCase().includes(lowercasedTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm)) ||
        (Array.isArray(item.subtasks) && item.subtasks.some(subtask => subtask.text.toLowerCase().includes(lowercasedTerm)))
      );
    } else {
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
  
  const handleToggleSubtask = (itemId: string, subtaskId: string) => {
    setItems(prevItems => 
        prevItems.map(item => {
            if (item.id === itemId && Array.isArray(item.subtasks)) {
                return {
                    ...item,
                    subtasks: item.subtasks.map(subtask => 
                        subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
                    )
                };
            }
            return item;
        })
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
    setNewItemSubtasks([]);
    setNewSubtaskText('');
    setNewSpaceName('');
    setSpaceToDelete(null);
    setModalContextSpaceId(null);
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
    if (newItemTitle.trim() && modalContextSpaceId) {
       const newItem: Item = {
        id: `item-${Date.now()}`,
        spaceId: modalContextSpaceId,
        title: newItemTitle.trim(),
        content: newItemContent,
        status: Status.ToDo,
        createdAt: Date.now(),
        tags: newItemTags.split(',').map(t => t.trim()).filter(Boolean),
        subtasks: newItemSubtasks,
      };
      setItems(prev => [newItem, ...prev]);
      handleCloseModal();
    }
  };
  
  const handleOpenNewItemModal = () => {
    const currentSpaceId = activeSpaceId;
    if (currentSpaceId) {
        setModalContextSpaceId(currentSpaceId);
        setModal('newItem');
    } else {
        // This case is handled by the command palette, but as a fallback:
        alert("Please select a space first to create an item.");
    }
  };

  const handleOpenEditModal = (item: Item) => {
    setEditingItem(item);
    setNewItemTitle(item.title);
    setNewItemContent(item.content);
    setNewItemTags(item.tags.join(', '));
    setNewItemSubtasks(item.subtasks || []);
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
                content: newItemContent,
                tags: newItemTags.split(',').map(t => t.trim()).filter(Boolean),
                subtasks: newItemSubtasks,
              }
            : item
        )
      );
      handleCloseModal();
    }
  };

  const handleAddSubtask = () => {
    if (newSubtaskText.trim()) {
        const newSubtask: Subtask = {
            id: `sub-${Date.now()}`,
            text: newSubtaskText.trim(),
            completed: false,
        };
        setNewItemSubtasks(prev => [...prev, newSubtask]);
        setNewSubtaskText('');
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    setNewItemSubtasks(prev => prev.filter(sub => sub.id !== subtaskId));
  };
  
  const handleExportData = () => {
    const data = JSON.stringify({ spaces, items }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    handleCloseModal();
  };
  
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.spaces && data.items && Array.isArray(data.spaces) && Array.isArray(data.items)) {
            if (window.confirm("Are you sure you want to import this data? This will overwrite your current spaces and items.")) {
                setSpaces(data.spaces);
                setItems(data.items);
                handleCloseModal();
            }
          } else {
            alert('Invalid backup file format.');
          }
        } catch (error) {
          alert('Error reading backup file.');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = ''; // Reset file input
  };
  
  const renderModalContent = () => {
    if (modal === 'settings') {
        return (
            <div>
                <h3 className="text-lg font-semibold text-secondary mb-3">Data Management</h3>
                <div className="space-y-4">
                    <button onClick={handleExportData} className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Export Data to JSON
                    </button>
                    <div>
                        <input type="file" accept=".json" ref={importFileRef} onChange={handleImportData} className="hidden" />
                        <button onClick={() => importFileRef.current?.click()} className="w-full flex items-center justify-center bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">
                           <UploadIcon className="w-5 h-5 mr-2" />
                           Import Data from JSON
                        </button>
                         <p className="text-xs text-gray-500 mt-2">Note: Importing will overwrite all current data.</p>
                    </div>
                </div>
            </div>
        )
    }
    if (modal === 'newSpace') {
      return (
        <form onSubmit={handleCreateSpace}>
          <label htmlFor="spaceName" className="block text-sm font-medium text-gray-700 mb-1">Space Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FolderIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
                id="spaceName" type="text" value={newSpaceName} onChange={e => setNewSpaceName(e.target.value)}
                className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-3 pl-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                placeholder="e.g. Project Phoenix" autoFocus
            />
          </div>
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
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label htmlFor="itemTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <input id="itemTitle" type="text" value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)}
                                className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-3 pl-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                placeholder="e.g. Design new homepage" autoFocus/>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="itemContent" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <div className="relative">
                           <div className="absolute top-3 left-0 flex items-center pl-3 pointer-events-none">
                                <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <textarea
                                id="itemContent"
                                value={newItemContent}
                                onChange={e => setNewItemContent(e.target.value)}
                                className="w-full h-24 bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-3 pl-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500 resize-y"
                                placeholder="Add notes, links, or details..."
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="itemTags" className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <TagIcon className="w-5 h-5 text-gray-400" />
                            </div>
                            <input id="itemTags" type="text" value={newItemTags} onChange={e => setNewItemTags(e.target.value)}
                                className="w-full bg-gray-100 border border-gray-300 text-gray-900 rounded-lg p-3 pl-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                                placeholder="e.g. dev, planning, urgent"/>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Separate tags with a comma.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Checklist</label>
                        <div className="bg-gray-100 p-3 rounded-lg space-y-2">
                           {newItemSubtasks.map(subtask => (
                               <div key={subtask.id} className="flex items-center justify-between">
                                   <span className="text-sm text-gray-800">{subtask.text}</span>
                                   <button type="button" onClick={() => handleDeleteSubtask(subtask.id)} className="text-gray-400 hover:text-red-600">
                                       <XIcon className="w-4 h-4" />
                                   </button>
                               </div>
                           ))}
                           <div className="flex items-center space-x-2 pt-2">
                               <div className="flex-grow flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden">
                                   <div className="p-2 bg-gray-100 border-r border-gray-300">
                                       <PlusIcon className="w-5 h-5 text-gray-500" />
                                   </div>
                                   <input type="text" value={newSubtaskText} onChange={e => setNewSubtaskText(e.target.value)} 
                                       onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); }}}
                                       className="w-full p-2 bg-transparent focus:outline-none text-sm text-gray-900"
                                       placeholder="Add new sub-task..."/>
                                </div>
                               <button type="button" onClick={handleAddSubtask} className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 flex-shrink-0">Add</button>
                           </div>
                        </div>
                    </div>
                </div>
                <button type="submit" className="w-full mt-6 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
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
    <div className="h-screen w-screen flex bg-background text-secondary font-sans overflow-hidden">
      <Sidebar
        spaces={spaces}
        activeSpaceId={activeSpaceId}
        onSelectSpace={handleSelectSpace}
        onNewSpace={handleOpenNewSpaceModal}
        onDeleteSpace={handleOpenDeleteSpaceModal}
        onOpenSettings={handleOpenSettingsModal}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          spaces={spaces}
          activeSpaceId={activeSpaceId}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />
        <Dashboard
          items={filteredItems}
          activeSpaceId={activeSpaceId}
          statusFilter={statusFilter}
          onFilterChange={setStatusFilter}
          onStatusChange={handleUpdateItemStatus}
          onNewItem={handleOpenNewItemModal}
          onEditItem={handleOpenEditModal}
          onToggleSubtask={handleToggleSubtask}
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
            modal === 'settings' ? 'Settings' :
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
        onSelectSpace={handleSelectSpace}
        onNewSpace={handleOpenNewSpaceModal}
        onNewItem={handleOpenNewItemModal}
        onEditItem={handleOpenEditModal}
      />
    </div>
  );
};

export default App;
