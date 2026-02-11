<script lang="ts">
	import { enhance } from '$app/forms';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Badge } from '$lib/components/ui/badge';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { animate } from 'animejs';

	const SWIPE_THRESHOLD = 160;
	const VELOCITY_THRESHOLD = 0.3;
	const RUBBER_BAND_FACTOR = 0.3;

	type Recipe = {
		id: number;
		name: string;
		ingredients: { id: number; name: string; quantity: number; unit: string }[];
	};

	let {
		recipe,
		selected,
		isOpen,
		onToggleSelect,
		onRequestOpen,
		onRequestClose
	}: {
		recipe: Recipe;
		selected: boolean;
		isOpen: boolean;
		onToggleSelect: () => void;
		onRequestOpen: () => void;
		onRequestClose: () => void;
	} = $props();

	let cardEl: HTMLDivElement | undefined = $state();
	let wrapperEl: HTMLDivElement | undefined = $state();
	let deleting = $state(false);

	// Pointer tracking
	let startX = 0;
	let startY = 0;
	let lastX = 0;
	let lastTime = 0;
	let velocityX = 0;
	let dragging = false;
	let directionDecided = false;
	let isHorizontal = false;
	let pointerId: number | null = null;

	function onPointerDown(e: PointerEvent) {
		if (deleting) return;
		// Only handle primary pointer (left click / single touch)
		if (e.button !== 0) return;

		startX = e.clientX;
		startY = e.clientY;
		lastX = e.clientX;
		lastTime = e.timeStamp;
		velocityX = 0;
		dragging = false;
		directionDecided = false;
		isHorizontal = false;
		pointerId = e.pointerId;

		cardEl?.setPointerCapture(e.pointerId);
	}

	function onPointerMove(e: PointerEvent) {
		if (pointerId === null || e.pointerId !== pointerId) return;

		const dx = e.clientX - startX;
		const dy = e.clientY - startY;

		if (!directionDecided) {
			const absDx = Math.abs(dx);
			const absDy = Math.abs(dy);
			// Need at least 8px movement to decide direction
			if (absDx < 8 && absDy < 8) return;
			directionDecided = true;
			isHorizontal = absDx > absDy;
			if (!isHorizontal) {
				// Let the browser handle vertical scrolling
				cardEl?.releasePointerCapture(e.pointerId);
				pointerId = null;
				return;
			}
		}

		if (!isHorizontal) return;

		e.preventDefault();
		dragging = true;

		// Calculate velocity
		const dt = e.timeStamp - lastTime;
		if (dt > 0) {
			velocityX = (e.clientX - lastX) / dt;
		}
		lastX = e.clientX;
		lastTime = e.timeStamp;

		// Raw offset from swipe start position
		const base = isOpen ? -SWIPE_THRESHOLD : 0;
		let offset = base + dx;

		// Clamp: can't go right past 0, rubber band past -SWIPE_THRESHOLD
		if (offset > 0) {
			offset = offset * RUBBER_BAND_FACTOR;
		} else if (offset < -SWIPE_THRESHOLD) {
			const over = offset + SWIPE_THRESHOLD;
			offset = -SWIPE_THRESHOLD + over * RUBBER_BAND_FACTOR;
		}

		if (cardEl) {
			cardEl.style.transform = `translateX(${offset}px)`;
		}
	}

	function onPointerUp(e: PointerEvent) {
		if (pointerId === null || e.pointerId !== pointerId) return;
		pointerId = null;

		if (!dragging) {
			// No drag happened — treat as tap
			if (isOpen) {
				onRequestClose();
			} else {
				onToggleSelect();
			}
			return;
		}

		// Decide whether to snap open or closed based on position + velocity
		const base = isOpen ? -SWIPE_THRESHOLD : 0;
		const dx = e.clientX - startX;
		const finalOffset = base + dx;

		const shouldOpen =
			finalOffset < -SWIPE_THRESHOLD / 2 || velocityX < -VELOCITY_THRESHOLD;
		const shouldClose =
			finalOffset > -SWIPE_THRESHOLD / 2 || velocityX > VELOCITY_THRESHOLD;

		if (shouldOpen && !shouldClose) {
			onRequestOpen();
		} else {
			onRequestClose();
		}
	}

	function onPointerCancel(e: PointerEvent) {
		if (pointerId === null || e.pointerId !== pointerId) return;
		pointerId = null;
		// Snap back to current state
		animateSnap(isOpen ? -SWIPE_THRESHOLD : 0);
	}

	function animateSnap(targetX: number) {
		if (!cardEl) return;
		animate(cardEl, {
			translateX: targetX,
			duration: 300,
			ease: 'outQuint'
		});
	}

	// React to isOpen changes (from parent) to animate
	$effect(() => {
		const target = isOpen ? -SWIPE_THRESHOLD : 0;
		animateSnap(target);
	});

	function handleDelete() {
		deleting = true;
		if (!wrapperEl) return true;

		animate(wrapperEl, {
			height: 0,
			opacity: 0,
			marginBottom: 0,
			duration: 300,
			ease: 'outQuint'
		});

		// Return true to let the form actually submit after animation starts
		return true;
	}
</script>

<div
	bind:this={wrapperEl}
	class="relative overflow-hidden rounded-xl"
	style="will-change: height, opacity;"
>
	<!-- Action buttons layer (underneath, right-aligned) -->
	<div class="absolute inset-y-0 right-0 flex">
		<a
			href="/recipes/{recipe.id}"
			class="bg-secondary text-secondary-foreground flex w-20 items-center justify-center"
			aria-label="Edit {recipe.name}"
		>
			<Pencil class="size-5" />
		</a>
		<form
			action="?/delete"
			method="POST"
			class="flex"
			use:enhance={() => {
				handleDelete();
				return async ({ update }) => {
					await update();
				};
			}}
		>
			<input type="hidden" name="id" value={recipe.id} />
			<button
				type="submit"
				class="bg-destructive flex w-20 items-center justify-center text-white"
				aria-label="Delete {recipe.name}"
			>
				<Trash2 class="size-5" />
			</button>
		</form>
	</div>

	<!-- Foreground card -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={cardEl}
		class="bg-card relative flex items-center gap-3 rounded-xl border p-3 sm:gap-4 sm:p-4"
		style="touch-action: pan-y; will-change: transform;"
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerCancel}
	>
		<Checkbox
			checked={selected}
			onCheckedChange={onToggleSelect}
			onclick={(e: MouseEvent) => e.stopPropagation()}
		/>
		<div class="flex min-w-0 flex-1 items-center gap-2">
			<h2 class="truncate font-medium">{recipe.name}</h2>
			<Badge variant="secondary" class="shrink-0">
				{recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 's' : ''}
			</Badge>
		</div>
	</div>
</div>
