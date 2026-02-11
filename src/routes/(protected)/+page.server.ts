import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { recipe } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const recipes = await db.query.recipe.findMany({
		where: eq(recipe.userId, locals.user!.id),
		with: { ingredients: true },
		orderBy: (recipe, { desc }) => [desc(recipe.createdAt)]
	});

	return { recipes };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user) return fail(401);

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		if (!id) return fail(400);

		const existing = await db.query.recipe.findFirst({
			where: and(eq(recipe.id, id), eq(recipe.userId, locals.user.id))
		});
		if (!existing) return error(404, 'Recipe not found');

		await db.delete(recipe).where(eq(recipe.id, existing.id));

		return { deleted: true };
	}
};
