<script lang="ts">
 import { goto } from "$app/navigation";
 export let data: any;

 async function edit() {
  goto("/board/edit/" + data.type + "?pid=" + data.puzzle_id);
 }
</script>

<div class="border-container flex-col items-center justify-center">
 <h2 class="text-center">{data.type}</h2>
 <!-- <img src={data.thumbnail} class="my-2" alt={data.type} /> -->
 <button class="bg-accent-1  dark:bg-d-accent-1 px-5 py-2" on:click={edit}
  >Create Puzzle</button
 >
</div>
