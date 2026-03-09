import React, { useState, useEffect } from 'react';
import { Camera, Bell, ChefHat, LayoutDashboard, History, Settings, AlertTriangle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodItem } from './types';
import CameraScanner from './components/CameraScanner';
import InventoryList from './components/InventoryList';
import RecipePanel from './components/RecipePanel';
import AddItemModal from './components/AddItemModal';

export default function App() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'inventory' | 'recipes'>('inventory');
  const [showScanner, setShowScanner] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [detectedItem, setDetectedItem] = useState<{ name: string; category: string; expiryDays: number } | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    checkExpirations();
  }, [items]);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkExpirations = () => {
    const today = new Date();
    const expiringSoon = items.filter(item => {
      const expiry = new Date(item.expiryDate);
      const diff = expiry.getTime() - today.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 2;
    });

    if (expiringSoon.length > 0) {
      const names = expiringSoon.map(i => i.name).join(', ');
      setNotifications([`Attention: The following food expires within 2 days: ${names}`]);
    } else {
      setNotifications([]);
    }
  };

  const addItem = async (data: { name: string; category: string; expiryDate: string }) => {
    const newItem: FoodItem = {
      id: crypto.randomUUID(),
      name: data.name,
      category: data.category,
      expiryDate: data.expiryDate,
      addedDate: new Date().toISOString(),
      quantity: '1'
    };

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        setItems(prev => [newItem, ...prev]);
        setShowAddModal(false);
        setDetectedItem(null);
      }
    } catch (error) {
      console.error("Failed to add item:", error);
      alert("Failed to save item to database.");
    }
  };

  const removeItem = async (id: string) => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleDetectedItem = (data: { name: string; category: string; expiryDays: number }) => {
    setDetectedItem(data);
    setShowScanner(false);
    setShowAddModal(true);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ChefHat className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">FridgeMate</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
              )}
            </div>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors text-sm font-medium">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-32">
        {/* Notifications Bar */}
        <AnimatePresence>
          {notifications.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: [1, 1.01, 1],
              }}
              transition={{
                scale: {
                  repeat: Infinity,
                  duration: 2,
                  ease: "easeInOut"
                }
              }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800 shadow-lg shadow-red-500/10"
            >
              <div className="bg-red-500 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white flex-shrink-0" />
              </div>
              <p className="text-sm font-bold flex-1">{notifications[0]}</p>
              <button onClick={() => setNotifications([])} className="p-1 hover:bg-red-100 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-zinc-200/50 rounded-2xl w-fit mb-8">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'inventory' 
                ? 'bg-white text-zinc-900 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Inventory
          </button>
          <button 
            onClick={() => setActiveTab('recipes')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'recipes' 
                ? 'bg-white text-zinc-900 shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            Recipes
          </button>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
              <p className="text-zinc-500">Loading your fridge...</p>
            </div>
          ) : activeTab === 'inventory' ? (
            <InventoryList 
              items={items} 
              onRemove={removeItem} 
              onAddManual={() => setShowAddModal(true)} 
            />
          ) : (
            <RecipePanel inventory={items} />
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
        <button 
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-full font-bold text-lg shadow-2xl shadow-emerald-500/40 hover:bg-emerald-600 hover:scale-105 transition-all active:scale-95 group"
        >
          <Camera className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          Scan Food
        </button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showScanner && (
          <CameraScanner 
            onItemDetected={handleDetectedItem} 
            onClose={() => setShowScanner(false)} 
          />
        )}
        
        {showAddModal && (
          <AddItemModal 
            onClose={() => {
              setShowAddModal(false);
              setDetectedItem(null);
            }} 
            onAdd={addItem}
            initialData={detectedItem || undefined}
          />
        )}
      </AnimatePresence>

      {/* Mobile Nav Spacer */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}
