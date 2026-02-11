import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { recipe } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const recipes = await db.query.recipe.findMany({
		where: eq(recipe.userId, locals.user!.id),
		with: { ingredients: true },
		orderBy: (recipe, { desc }) => [desc(recipe.createdAt)]
	});

	return { recipes };
};
