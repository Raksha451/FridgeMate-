import React, { useState } from 'react';
import { ChefHat, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import Markdown from 'react-markdown';
import { suggestRecipes } from '../services/gemini';
import { FoodItem } from '../types';

interface RecipePanelProps {
  inventory: FoodItem[];
}

export default function RecipePanel({ inventory }: RecipePanelProps) {
  const [recipes, setRecipes] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateRecipes = async () => {
    if (inventory.length === 0) return;
    setLoading(true);
    const result = await suggestRecipes(inventory);
    setRecipes(result);
    setLoading(false);
  };

  return (
    <div className="bg-zinc-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <ChefHat className="w-32 h-32" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              AI Recipe Suggestions
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </h2>
            <p className="text-zinc-400 text-sm mt-1">Based on what's in your fridge</p>
          </div>
          
          {inventory.length > 0 && (
            <button 
              onClick={generateRecipes}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50 font-medium text-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {recipes ? 'Refresh' : 'Generate'}
            </button>
          )}
        </div>

        {!recipes && !loading && (
          <div className="text-center py-12 border border-white/10 rounded-2xl bg-white/5">
            <ChefHat className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">
              {inventory.length > 0 
                ? "Click generate to see what you can cook today!" 
                : "Add items to your inventory to get recipe suggestions."}
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-white/10 rounded-lg w-1/3" />
            <div className="h-4 bg-white/10 rounded-lg w-full" />
            <div className="h-4 bg-white/10 rounded-lg w-5/6" />
            <div className="h-4 bg-white/10 rounded-lg w-4/6" />
          </div>
        )}

        {recipes && !loading && (
          <div className="markdown-body prose prose-invert max-w-none prose-emerald prose-headings:text-emerald-400 prose-strong:text-emerald-300 prose-p:text-zinc-300">
            <Markdown>{recipes}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
}
