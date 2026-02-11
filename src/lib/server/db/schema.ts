import { relations } from 'drizzle-orm';
import { pgTable, serial, integer, text, real, timestamp, index } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const recipe = pgTable(
	'recipe',
	{
		id: serial('id').primaryKey(),
		name: text('name').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [index('recipe_userId_idx').on(table.userId)]
);

export const ingredient = pgTable(
	'ingredient',
	{
		id: serial('id').primaryKey(),
		recipeId: integer('recipe_id')
			.notNull()
			.references(() => recipe.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		quantity: real('quantity').notNull(),
		unit: text('unit').notNull()
	},
	(table) => [index('ingredient_recipeId_idx').on(table.recipeId)]
);

export const recipeRelations = relations(recipe, ({ many }) => ({
	ingredients: many(ingredient)
}));

export const ingredientRelations = relations(ingredient, ({ one }) => ({
	recipe: one(recipe, {
		fields: [ingredient.recipeId],
		references: [recipe.id]
	})
}));

export * from './auth.schema';
