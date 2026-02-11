<script lang="ts">
	import type { LayoutData } from './$types';
	import { Button } from '$lib/components/ui/button';

	let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();
</script>

<div class="min-h-svh bg-background">
	<header class="border-b">
		<div class="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
			<a href="/" class="text-xl font-bold">eat</a>
			<div class="flex items-center gap-4">
				<span class="text-sm text-muted-foreground">{data.user.name}</span>
				<Button variant="ghost" size="sm" href="/signout">Sign out</Button>
			</div>
		</div>
	</header>
	<main class="mx-auto max-w-4xl px-4 py-6">
		{@render children()}
	</main>
</div>
