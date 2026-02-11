<script lang="ts">
	import type { LayoutData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { toggleMode, mode } from 'mode-watcher';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();
</script>

<div class="min-h-svh bg-background">
	<header class="sticky top-0 z-10 border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
		<div class="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
			<a href="/" class="text-xl font-bold">eat</a>
			<div class="flex items-center gap-1 sm:gap-3">
				<span class="hidden text-sm text-muted-foreground sm:inline">{data.user.name}</span>
				<Button variant="ghost" size="icon" onclick={toggleMode} aria-label="Toggle theme">
					{#if mode.current === 'light'}
						<Sun class="size-5" />
					{:else}
						<Moon class="size-5" />
					{/if}
				</Button>
				<Button variant="ghost" size="sm" href="/signout">Sign out</Button>
			</div>
		</div>
	</header>
	<main class="mx-auto max-w-4xl px-4 py-4 sm:py-6">
		{@render children()}
	</main>
</div>
