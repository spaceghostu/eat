<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import SwipeableRecipeCard from '$lib/components/swipeable-recipe-card.svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import ClipboardCopy from '@lucide/svelte/icons/clipboard-copy';
	import { toast } from 'svelte-sonner';
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';

	let { data }: { data: PageData } = $props();

	let selectedIds = new SvelteSet<number>();
	let sheetOpen = $state(false);
	let checkedItems = new SvelteSet<string>();
	let openCardId = $state<number | null>(null);

	function toggleRecipe(id: number) {
		if (selectedIds.has(id)) {
			selectedIds.delete(id);
		} else {
			selectedIds.add(id);
		}
	}

	// Clean up selectedIds when recipes change (e.g. after delete)
	$effect(() => {
		const recipeIds = new Set(data.recipes.map((r) => r.id));
		for (const id of selectedIds) {
			if (!recipeIds.has(id)) {
				selectedIds.delete(id);
			}
		}
	});

	// Close open card on scroll
	function onScroll() {
		if (openCardId !== null) {
			openCardId = null;
		}
	}

	const shoppingList = $derived.by(() => {
		const selected = data.recipes.filter((r) => selectedIds.has(r.id));
		const grouped = new SvelteMap<string, { name: string; quantity: number; unit: string }>();

		for (const recipe of selected) {
			for (const ing of recipe.ingredients) {
				const key = `${ing.name.toLowerCase()}|${ing.unit.toLowerCase()}`;
				const existing = grouped.get(key);
				if (existing) {
					existing.quantity += ing.quantity;
				} else {
					grouped.set(key, {
						name: ing.name,
						quantity: ing.quantity,
						unit: ing.unit
					});
				}
			}
		}

		return [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name));
	});

	function openShoppingList() {
		checkedItems.clear();
		sheetOpen = true;
	}

	function toggleItem(key: string) {
		if (checkedItems.has(key)) {
			checkedItems.delete(key);
		} else {
			checkedItems.add(key);
		}
	}

	async function copyToClipboard() {
		const text = shoppingList
			.map((item) => `${item.quantity} ${item.unit} ${item.name}`)
			.join('\n');
		await navigator.clipboard.writeText(text);
		toast.success('Shopping list copied to clipboard');
	}
</script>

<svelte:window onscroll={onScroll} />

<div>
	<div class="mb-4 flex items-center justify-between gap-2 sm:mb-6">
		<h1 class="text-xl font-bold sm:text-2xl">Recipes</h1>
		<div class="flex gap-2">
			{#if selectedIds.size > 0}
				<Button variant="outline" size="sm" class="sm:size-default" onclick={openShoppingList}>
					<ShoppingCart class="size-4" />
					<span class="hidden sm:inline">Shopping List</span> ({selectedIds.size})
				</Button>
			{/if}
			<Button size="sm" class="sm:size-default" href="/recipes/new">New Recipe</Button>
		</div>
	</div>

	{#if data.recipes.length === 0}
		<Card.Root class="text-center">
			<Card.Content class="py-12">
				<p class="mb-4 text-muted-foreground">No recipes yet. Create your first recipe!</p>
				<Button href="/recipes/new">New Recipe</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<div class="space-y-2 sm:space-y-3">
			{#each data.recipes as recipe (recipe.id)}
				<SwipeableRecipeCard
					{recipe}
					selected={selectedIds.has(recipe.id)}
					isOpen={openCardId === recipe.id}
					onToggleSelect={() => toggleRecipe(recipe.id)}
					onRequestOpen={() => (openCardId = recipe.id)}
					onRequestClose={() => {
						if (openCardId === recipe.id) openCardId = null;
					}}
				/>
			{/each}
		</div>
	{/if}
</div>

<Sheet.Root bind:open={sheetOpen}>
	<Sheet.Content>
		<Sheet.Header>
			<Sheet.Title>Shopping List</Sheet.Title>
			<Sheet.Description>
				Combined ingredients from {selectedIds.size} selected recipe{selectedIds.size !== 1
					? 's'
					: ''}
			</Sheet.Description>
		</Sheet.Header>
		<div class="flex flex-1 flex-col gap-2 overflow-y-auto py-4">
			{#each shoppingList as item (item.name + '|' + item.unit)}
				{@const key = `${item.name}|${item.unit}`}
				<button
					type="button"
					class="flex items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent"
					onclick={() => toggleItem(key)}
				>
					<Checkbox checked={checkedItems.has(key)} />
					<span
						class={checkedItems.has(key) ? 'text-muted-foreground line-through' : ''}
					>
						{item.quantity} {item.unit} {item.name}
					</span>
				</button>
			{/each}
		</div>
		<Sheet.Footer>
			<Button variant="outline" class="w-full" onclick={copyToClipboard}>
				<ClipboardCopy class="size-4" />
				Copy to Clipboard
			</Button>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
