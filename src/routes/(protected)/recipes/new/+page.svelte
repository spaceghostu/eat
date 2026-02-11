<script lang="ts">
	import type { PageData } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import RecipeForm from '$lib/components/recipe-form.svelte';

	let { data }: { data: PageData } = $props();

	const formInstance = $derived(superForm(data.form, { dataType: 'json' }));
</script>

<div>
	<h1 class="mb-6 text-2xl font-bold">New Recipe</h1>
	<RecipeForm {formInstance} submitLabel="Create Recipe" />
</div>
