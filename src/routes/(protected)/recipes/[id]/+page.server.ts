import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { recipeSchema } from '$lib/validators/recipe';
import { db } from '$lib/server/db';
import { recipe, ingredient } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) return redirect(302, '/signin');

	const recipeData = await db.query.recipe.findFirst({
		where: and(eq(recipe.id, Number(params.id)), eq(recipe.userId, locals.user.id)),
		with: { ingredients: true }
	});

	if (!recipeData) return error(404, 'Recipe not found');

	const form = await superValidate(
		{
			name: recipeData.name,
			ingredients: recipeData.ingredients.map((ing) => ({
				name: ing.name,
				quantity: ing.quantity,
				unit: ing.unit
			}))
		},
		zod4(recipeSchema)
	);

	return { form, recipeId: recipeData.id };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		if (!locals.user) return fail(401);

		const existing = await db.query.recipe.findFirst({
			where: and(eq(recipe.id, Number(params.id)), eq(recipe.userId, locals.user.id))
		});
		if (!existing) return error(404, 'Recipe not found');

		const form = await superValidate(request, zod4(recipeSchema));
		if (!form.valid) return fail(400, { form });

		await db
			.update(recipe)
			.set({ name: form.data.name })
			.where(eq(recipe.id, existing.id));

		await db.delete(ingredient).where(eq(ingredient.recipeId, existing.id));

		if (form.data.ingredients.length > 0) {
			await db.insert(ingredient).values(
				form.data.ingredients.map((ing) => ({
					recipeId: existing.id,
					name: ing.name,
					quantity: ing.quantity,
					unit: ing.unit
				}))
			);
		}

		return redirect(303, '/');
	},

	delete: async ({ params, locals }) => {
		if (!locals.user) return fail(401);

		const existing = await db.query.recipe.findFirst({
			where: and(eq(recipe.id, Number(params.id)), eq(recipe.userId, locals.user.id))
		});
		if (!existing) return error(404, 'Recipe not found');

		await db.delete(recipe).where(eq(recipe.id, existing.id));

		return redirect(303, '/');
	}
};
