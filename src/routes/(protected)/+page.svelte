<script lang="ts">
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Badge } from '$lib/components/ui/badge';
	import * as Sheet from '$lib/components/ui/sheet';
	import ShoppingCart from '@lucide/svelte/icons/shopping-cart';
	import ClipboardCopy from '@lucide/svelte/icons/clipboard-copy';
	import { toast } from 'svelte-sonner';
	import { SvelteSet, SvelteMap } from 'svelte/reactivity';

	let { data }: { data: PageData } = $props();

	let selectedIds = new SvelteSet<number>();
	let sheetOpen = $state(false);
	let checkedItems = new SvelteSet<string>();

	function toggleRecipe(id: number) {
		if (selectedIds.has(id)) {
			selectedIds.delete(id);
		} else {
			selectedIds.add(id);
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

<div>
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold">Recipes</h1>
		<div class="flex gap-2">
			{#if selectedIds.size > 0}
				<Button variant="outline" onclick={openShoppingList}>
					<ShoppingCart class="size-4" />
					Shopping List ({selectedIds.size})
				</Button>
			{/if}
			<Button href="/recipes/new">New Recipe</Button>
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
		<div class="space-y-3">
			{#each data.recipes as recipe (recipe.id)}
				<Card.Root class="transition-colors hover:bg-accent/50">
					<div class="flex items-center gap-4 p-4">
						<Checkbox
							checked={selectedIds.has(recipe.id)}
							onCheckedChange={() => toggleRecipe(recipe.id)}
						/>
						<a href="/recipes/{recipe.id}" class="flex flex-1 items-center justify-between">
							<div>
								<h2 class="font-medium">{recipe.name}</h2>
							</div>
							<Badge variant="secondary">
								{recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1
									? 's'
									: ''}
							</Badge>
						</a>
					</div>
				</Card.Root>
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
