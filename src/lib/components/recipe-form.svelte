<script lang="ts">
	import { type SuperForm, type Infer } from 'sveltekit-superforms';
	import type { recipeSchema } from '$lib/validators/recipe';
	import { UNITS } from '$lib/validators/recipe';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import CirclePlus from '@lucide/svelte/icons/circle-plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { get } from 'svelte/store';

	type RecipeData = Infer<typeof recipeSchema>;

	let {
		formInstance,
		submitLabel = 'Save Recipe',
		action
	}: {
		formInstance: SuperForm<RecipeData>;
		submitLabel?: string;
		action?: string;
	} = $props();

	const { form, errors, enhance, submitting } = $derived(formInstance);

	function addIngredient() {
		form.update((f: RecipeData) => ({
			...f,
			ingredients: [...f.ingredients, { name: '', quantity: 0, unit: '' }]
		}));
	}

	function removeIngredient(index: number) {
		form.update((f: RecipeData) => ({
			...f,
			ingredients: f.ingredients.filter((_: unknown, i: number) => i !== index)
		}));
	}
</script>

<form method="POST" {action} use:enhance class="space-y-6">
	<div class="space-y-2">
		<Label for="name">Recipe Name</Label>
		<Input id="name" name="name" bind:value={$form.name} placeholder="e.g. Pasta Carbonara" />
		{#if $errors.name}
			<p class="text-sm text-destructive">{$errors.name[0]}</p>
		{/if}
	</div>

	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<Label>Ingredients</Label>
			<Button type="button" variant="outline" size="sm" onclick={addIngredient}>
				<CirclePlus class="size-4" />
				Add ingredient
			</Button>
		</div>

		{#if $errors.ingredients?._errors}
			<p class="text-sm text-destructive">{$errors.ingredients._errors[0]}</p>
		{/if}

		<div class="space-y-4 sm:space-y-3">
			{#each $form.ingredients as _, i (i)}
				<div class="rounded-lg border bg-card p-3 sm:border-0 sm:bg-transparent sm:p-0">
					<div class="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:items-start">
						<div class="col-span-2 space-y-1 sm:flex-1">
							<Input
								name="ingredients[{i}].name"
								bind:value={$form.ingredients[i].name}
								placeholder="Ingredient name"
							/>
							{#if $errors.ingredients?.[i]?.name}
								<p class="text-xs text-destructive">{$errors.ingredients[i].name[0]}</p>
							{/if}
						</div>
						<div class="space-y-1 sm:w-24">
							<Input
								name="ingredients[{i}].quantity"
								type="number"
								step="any"
								min="0"
								bind:value={$form.ingredients[i].quantity}
								placeholder="Qty"
							/>
							{#if $errors.ingredients?.[i]?.quantity}
								<p class="text-xs text-destructive">{$errors.ingredients[i].quantity[0]}</p>
							{/if}
						</div>
						<div class="space-y-1 sm:w-28">
							<Select.Root
								type="single"
								value={$form.ingredients[i].unit}
								onValueChange={(v) => {
									form.update((f: RecipeData) => {
										f.ingredients[i].unit = v;
										return f;
									});
								}}
							>
								<Select.Trigger class="w-full">
									{$form.ingredients[i].unit || 'Unit'}
								</Select.Trigger>
								<Select.Content>
									{#each UNITS as unit (unit)}
										<Select.Item value={unit}>{unit}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="ingredients[{i}].unit" value={$form.ingredients[i].unit} />
							{#if $errors.ingredients?.[i]?.unit}
								<p class="text-xs text-destructive">{$errors.ingredients[i].unit[0]}</p>
							{/if}
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							class="self-end shrink-0 sm:mt-0.5 sm:self-start"
							onclick={() => removeIngredient(i)}
							disabled={get(form).ingredients.length <= 1}
						>
							<Trash2 class="size-4" />
						</Button>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<Button type="submit" disabled={$submitting} class="w-full">
		{submitLabel}
	</Button>
</form>
