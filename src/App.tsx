/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Tag as TagIcon, 
  X, 
  Clock, 
  Hash,
  StickyNote,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Note = {
  id: number;
  title: string;
  body: string;
  tags: string[];
  updatedAt: string;
};

const STORAGE_KEY = 'mymemo.notes';

const SEED_DATA: Note[] = [
  {
    id: 1,
    title: "시안 작업 가이드",
    body: "디자인 시안 작업 시 폰트 크기는 최소 12px 이상을 권장하며, 브랜드 컬러를 우선적으로 사용합니다. 간격은 4의 배수를 활용하세요.",
    tags: ["디자인", "가이드"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "읽어야 할 책 리스트",
    body: "1. 클린 코드\n2. 디자인 오브 에브리데이 씽스\n3. 리팩토링\n4. 실용주의 프로그래머",
    tags: ["독서", "자기개발"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "프로젝트 아이디어",
    body: "AI 기반의 일정 관리 도구, 사용자의 습관을 분석하여 최적의 집중 시간을 추천해주는 모바일 앱 기획.",
    tags: ["업무", "개발"],
    updatedAt: new Date().toISOString(),
  }
];

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formTags, setFormTags] = useState('');

  // Initial load
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse notes', e);
        setNotes(SEED_DATA);
      }
    } else {
      setNotes(SEED_DATA);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    }
  }, []);

  // Save on change
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes]);

  const allTags = useMemo(() => {
    const tagsMap = new Map<string, number>();
    notes.forEach(note => {
      note.tags.forEach(tag => {
        tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
      });
    });
    return Array.from(tagsMap.entries()).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesTag = !selectedTag || note.tags.includes(selectedTag);
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        note.title.toLowerCase().includes(searchStr) || 
        note.body.toLowerCase().includes(searchStr) || 
        note.tags.some(t => t.toLowerCase().includes(searchStr));
      return matchesTag && matchesSearch;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, selectedTag, searchTerm]);

  const handleOpenModal = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setFormTitle(note.title);
      setFormBody(note.body);
      setFormTags(note.tags.join(', '));
    } else {
      setEditingNote(null);
      setFormTitle('');
      setFormBody('');
      setFormTags('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const tags = formTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '');

    if (editingNote) {
      setNotes(prev => prev.map(n => n.id === editingNote.id ? {
        ...n,
        title: formTitle,
        body: formBody,
        tags,
        updatedAt: new Date().toISOString()
      } : n));
    } else {
      const newNote: Note = {
        id: Date.now(),
        title: formTitle,
        body: formBody,
        tags,
        updatedAt: new Date().toISOString()
      };
      setNotes(prev => [newNote, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('정말 이 메모를 삭제하시겠습니까?')) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg">
              <StickyNote className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">MyMemo</h1>
          </div>
          
          <nav className="space-y-1">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3 flex items-center gap-2">
              <Filter className="w-3 h-3" />
              <span>Filters</span>
            </div>
            <button 
              onClick={() => setSelectedTag(null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium transition-all ${!selectedTag ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                <StickyNote className="w-4 h-4" />
                <span>All Notes</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${!selectedTag ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                {notes.length.toString().padStart(2, '0')}
              </span>
            </button>

            <div className="pt-4 space-y-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3 flex items-center gap-2">
                <TagIcon className="w-3 h-3" />
                <span>Tags</span>
              </div>
              {allTags.map(([tag, count]) => (
                <button 
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all ${selectedTag === tag ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 opacity-70" />
                    <span className="truncate">{tag}</span>
                  </div>
                  <span className={`text-xs font-mono ${selectedTag === tag ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {count.toString().padStart(2, '0')}
                  </span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg">
            <div className="text-xs text-slate-400 mb-1 font-medium">Storage Usage</div>
            <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-indigo-500 transition-all duration-1000" 
                style={{ width: `${Math.min(100, (notes.length / 50) * 100)}%` }}
              ></div>
            </div>
            <div className="text-[10px] flex justify-between font-mono">
              <span>{notes.length} / 50 Notes</span>
              <span className="text-slate-500 uppercase tracking-tighter">Local Only</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search notes, tags..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md shadow-indigo-100 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>New Memo</span>
            </button>
          </div>
        </header>

        {/* Note Grid */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {filteredNotes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-300">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <StickyNote className="w-10 h-10" />
              </div>
              <p className="font-medium">No notes found matching your criteria</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedTag(null); }}
                className="mt-4 text-indigo-500 text-sm font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all relative flex flex-col min-h-[180px] cursor-pointer"
                    onClick={() => handleOpenModal(note)}
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(note.id);
                      }}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all z-10"
                      title="Delete memo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <h3 className="font-bold text-slate-900 mb-2 pr-8 group-hover:text-indigo-600 transition-colors">
                      {note.title}
                    </h3>
                    
                    <p className="text-sm text-slate-600 line-clamp-4 leading-relaxed flex-1 whitespace-pre-wrap">
                      {note.body}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {note.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                      {note.tags.length === 0 && (
                        <span className="text-[10px] text-slate-300 italic">No tags</span>
                      )}
                    </div>
                  </motion.div>
                ))}
                {/* Empty State / Placeholder for Grid Balance */}
                <motion.div 
                  layout
                  onClick={() => handleOpenModal()}
                  className="border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center p-5 opacity-40 hover:opacity-100 hover:border-indigo-300 transition-all cursor-pointer min-h-[180px]"
                >
                  <div className="text-center text-slate-400">
                    <Plus className="mx-auto mb-2 w-6 h-6" />
                    <p className="text-xs font-bold uppercase tracking-widest">Add New Memo</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingNote ? 'Edit Memo' : 'Create New Memo'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Title</label>
                  <input 
                    autoFocus
                    required
                    type="text" 
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Enter memo title..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Content</label>
                  <textarea 
                    rows={5}
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tags</label>
                  <input 
                    type="text" 
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="Work, Life, Study (separated by comma)"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-slate-600 font-semibold hover:text-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-95"
                  >
                    {editingNote ? 'Update Memo' : 'Save Memo'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
