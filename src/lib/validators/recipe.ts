import { z } from 'zod';

export const ingredientSchema = z.object({
	name: z.string().min(1, 'Ingredient name is required'),
	quantity: z.number().positive('Quantity must be positive'),
	unit: z.string().min(1, 'Unit is required')
});

export const recipeSchema = z.object({
	name: z.string().min(1, 'Recipe name is required'),
	ingredients: z.array(ingredientSchema).min(1, 'At least one ingredient is required')
});

export type RecipeFormData = z.infer<typeof recipeSchema>;

export const UNITS = [
	'g',
	'kg',
	'ml',
	'l',
	'cup',
	'tbsp',
	'tsp',
	'oz',
	'lb',
	'piece',
	'clove',
	'bunch',
	'pinch',
	'can',
	'slice'
] as const;
