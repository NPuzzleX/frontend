<script lang="ts">
 import { createEventDispatcher } from 'svelte';
 import CallAPI from "../helpers/axios";
 
 export let data: any;
 export let loggedIn: boolean;
 export let cacheAccess: boolean;
 export let offline: boolean;

 const dispatch = createEventDispatcher();

 async function toggleFavorite() {
  try {
   const getPuzzle = await CallAPI(
    "POST",
    "/puzzle/favourite",
    { puzzle_id: data.puzzle_id },
    {
        headers: {
            Authorization: "Bearer " + localStorage.getItem("NPToken"),
        }     
    }
   );

    dispatch('triggerFav', null);
  } catch (err) {
   alert(err);
  }
 }

 function clickDownload() {
    if (!offline) {
        dispatch('triggerDownload', null);
    }
 }
</script>

<div class="border-container flex-col items-center justify-center relative">
 <h2 class="text-center">{data.type}</h2>
 <small class="text-center">ID: {data.puzzle_id}</small>
 <small class="text-center">By: {data.username}</small>
 <img src={data.thumbnail} class="my-2" alt={data.type} />

 <div class="w-16 h-8 absolute right-2 bottom-2 cursor-pointer" style="display: flex; flex-direction:row-reverse">
    {#if loggedIn}
    <svg
     xmlns="http://www.w3.org/2000/svg"
     fill="none"
     viewBox="0 0 24 24"
     stroke-width="1.5"
     stroke={data.favourited ? "red" : "currentColor"}
     on:click={toggleFavorite}
    >
     <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      fill={data.favourited ? "red" : "white"}
     />
    </svg>
    {/if}
    {#if cacheAccess}
    <svg
     opacity={data.saved ? 1.0 : 0.2}
     xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 512 512"
     on:click={clickDownload}
    >
     <!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
     <path d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32V274.7l-73.4-73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0l128-128c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L288 274.7V32zM64 352c-35.3 0-64 28.7-64 64v32c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V416c0-35.3-28.7-64-64-64H346.5l-45.3 45.3c-25 25-65.5 25-90.5 0L165.5 352H64zM432 456c-13.3 0-24-10.7-24-24s10.7-24 24-24s24 10.7 24 24s-10.7 24-24 24z"/>
    </svg>
    {/if}
</div>

 {#if data.completed}
    <div 
        class="w-8 h-8 absolute left-2 bottom-2"
        style="font-weight:bolder; font-size:x-large; color:green"
    >✓</div>
 {/if}

 <a href={"/board/play/" + data.type + "?pid=" + data.puzzle_id}>
    <button class="bg-accent-1  dark:bg-d-accent-1 px-5 py-2"
    >Play Puzzle</button
    >
　</a>
</div>
