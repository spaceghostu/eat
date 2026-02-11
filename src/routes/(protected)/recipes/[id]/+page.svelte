<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { enhance } from '$app/forms';
	import RecipeForm from '$lib/components/recipe-form.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';

	let { data }: { data: PageData } = $props();

	const formInstance = $derived(superForm(data.form, { dataType: 'json' }));

	let deleteDialogOpen = $state(false);
</script>

<div>
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">Edit Recipe</h1>
		<Button variant="destructive" size="sm" onclick={() => (deleteDialogOpen = true)}>
			Delete
		</Button>
	</div>

	<RecipeForm {formInstance} submitLabel="Update Recipe" action="?/update" />
</div>

<Dialog.Root bind:open={deleteDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Recipe</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete this recipe? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (deleteDialogOpen = false)}>Cancel</Button>
			<form method="POST" action="?/delete" use:enhance>
				<Button type="submit" variant="destructive">Delete</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
