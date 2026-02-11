<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex min-h-svh items-center justify-center bg-background p-4">
	<Card.Root class="w-full max-w-md text-center">
		<Card.Header>
			<Card.Title class="text-2xl font-bold">Welcome, {data.user.name}</Card.Title>
			<Card.Description>You're signed in as {data.user.email}</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="text-muted-foreground">This is your dashboard. Start building something great.</p>
		</Card.Content>
		<Card.Footer class="justify-center">
			<Button variant="outline" href="/signout">Sign out</Button>
		</Card.Footer>
	</Card.Root>
</div>
