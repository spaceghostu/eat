<script lang="ts">
	import { enhance } from '$app/forms';
</script>

<form method="post" use:enhance>
	<button class="rounded-md bg-red-600 px-4 py-2 text-white transition hover:bg-red-700">
		Sign out
	</button>
</form>
