export type IngredientId = 'bun' | 'patty' | 'cheese' | 'lettuce' | 'sauce' | 'dough' | 'pepperoni';

export type IngredientSpec = {
  id: IngredientId;
  label: string;
  unit: string;
  initialQuantity: number;
};

export const ingredientSpecs: IngredientSpec[] = [
  { id: 'bun', label: 'Burger bunsi', unit: 'ədəd', initialQuantity: 120 },
  { id: 'patty', label: 'Dana kotleti', unit: 'ədəd', initialQuantity: 120 },
  { id: 'cheese', label: 'Pendir dilimi', unit: 'ədəd', initialQuantity: 200 },
  { id: 'lettuce', label: 'Salat yarpağı', unit: 'ədəd', initialQuantity: 150 },
  { id: 'sauce', label: 'Sous porsiyası', unit: 'ədəd', initialQuantity: 250 },
  { id: 'dough', label: 'Pizza xəmiri', unit: 'ədəd', initialQuantity: 80 },
  { id: 'pepperoni', label: 'Pepperoni dilimi', unit: 'ədəd', initialQuantity: 600 }
];
