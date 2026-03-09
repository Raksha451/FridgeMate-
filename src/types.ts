export interface FoodItem {
  id: string;
  name: string;
  category: string;
  expiryDate: string;
  addedDate: string;
  quantity: string;
}

export interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string;
  prepTime: string;
}
