import React, { useState } from 'react';
import { Trash2, Calendar, Package, Plus, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodItem } from '../types';

interface InventoryListProps {
  items: FoodItem[];
  onRemove: (id: string) => void;
  onAddManual: () => void;
}

export default function InventoryList({ items, onRemove, onAddManual }: InventoryListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.category.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const categories = ['all', ...new Set(items.map(item => item.category))];

  const getExpiryStatus = (date: string) => {
    const today = new Date();
    const expiry = new Date(date);
    const diff = expiry.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-200' };
    if (days <= 2) return { label: `Expires in ${days}d`, color: 'bg-orange-100 text-orange-700 border-orange-200' };
    return { label: `Expires in ${days}d`, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search your fridge..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          
          <button 
            onClick={onAddManual}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-sm text-sm font-medium whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => {
            const status = getExpiryStatus(item.expiryDate);
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow group relative"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Package className="w-5 h-5 text-emerald-600" />
                  </div>
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-semibold text-zinc-900 mb-1">{item.name}</h3>
                <p className="text-sm text-zinc-500 mb-4">{item.category}</p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100">
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Added {new Date(item.addedDate).toLocaleDateString()}</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
          <div className="inline-flex p-4 bg-white rounded-2xl shadow-sm mb-4">
            <Package className="w-8 h-8 text-zinc-300" />
          </div>
          <h3 className="text-lg font-medium text-zinc-900">Your fridge is empty</h3>
          <p className="text-zinc-500 max-w-xs mx-auto mt-2">
            Start adding items by scanning them or entering them manually.
          </p>
        </div>
      )}
    </div>
  );
}
