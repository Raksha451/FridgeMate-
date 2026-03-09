import React, { useState } from 'react';
import { X, Calendar, Package, Tag } from 'lucide-react';
import { motion } from 'motion/react';

interface AddItemModalProps {
  onClose: () => void;
  onAdd: (item: { name: string; category: string; expiryDate: string }) => void;
  initialData?: { name: string; category: string; expiryDays: number };
}

export default function AddItemModal({ onClose, onAdd, initialData }: AddItemModalProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState(initialData?.category || 'Vegetable');
  
  // Calculate default expiry date
  const getDefaultExpiry = () => {
    const d = new Date();
    d.setDate(d.getDate() + (initialData?.expiryDays || 7));
    return d.toISOString().split('T')[0];
  };
  
  const [expiryDate, setExpiryDate] = useState(getDefaultExpiry());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !expiryDate) return;
    onAdd({ name, category, expiryDate });
  };

  const categories = ['Vegetable', 'Fruit', 'Dairy', 'Meat', 'Pantry', 'Bakery', 'Beverage', 'Other'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-emerald-50/50">
          <h2 className="text-xl font-bold text-zinc-900">
            {initialData ? 'Confirm AI Detection' : 'Add New Item'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Item Name
            </label>
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Fresh Spinach"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Category
            </label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Expiry Date
            </label>
            <input 
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            {initialData ? 'Add to Fridge' : 'Save Item'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
