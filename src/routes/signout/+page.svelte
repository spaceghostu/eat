<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Spinner } from '$lib/components/ui/spinner';

	let isSubmitting = $state(false);
</script>

<div class="flex min-h-svh items-center justify-center bg-background p-4">
	<Card.Root class="w-full max-w-sm text-center">
		<Card.Header>
			<Card.Title class="text-2xl font-bold">Sign out</Card.Title>
			<Card.Description>Are you sure you want to sign out?</Card.Description>
		</Card.Header>
		<Card.Footer class="flex justify-center gap-3">
			<Button variant="outline" href="/">Cancel</Button>
			<form
				method="post"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
					};
				}}
			>
				<Button type="submit" variant="destructive" disabled={isSubmitting}>
					{#if isSubmitting}
						<Spinner class="mr-2 size-4" />
					{/if}
					Sign out
				</Button>
			</form>
		</Card.Footer>
	</Card.Root>
</div>
