import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) =>
	svelteKitHandler({ event, resolve: (e) => new Response(), auth });
export const POST: RequestHandler = async (event) =>
	svelteKitHandler({ event, resolve: (e) => new Response(), auth });
