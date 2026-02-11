import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { recipeSchema } from '$lib/validators/recipe';
import { db } from '$lib/server/db';
import { recipe, ingredient } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(recipeSchema));
	form.data.ingredients = [{ name: '', quantity: 0, unit: '' }];
	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const form = await superValidate(request, zod4(recipeSchema));
		if (!form.valid) return fail(400, { form });

		const [newRecipe] = await db
			.insert(recipe)
			.values({
				name: form.data.name,
				userId: locals.user.id
			})
			.returning({ id: recipe.id });

		if (form.data.ingredients.length > 0) {
			await db.insert(ingredient).values(
				form.data.ingredients.map((ing) => ({
					recipeId: newRecipe.id,
					name: ing.name,
					quantity: ing.quantity,
					unit: ing.unit
				}))
			);
		}

		return redirect(303, '/');
	}
};
