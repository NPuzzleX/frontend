<script lang="ts">
 import CallAPI from "../../../helpers/axios";
 import { onMount } from "svelte";
 import { goto } from "$app/navigation";
 import { offlineMode, user } from "../../../stores";

 var getParams = {
  page: 1,
  limit: 5,
  self: 1
 };
 var puzzles: any[] = [];
 let maxPage: number = 0;
 let offline: boolean = false;

 $: pageSubstract = Math.min(getParams.page, 3);

 async function getPuzzle(): Promise<void> {
  try {
   const getPuzzle = await CallAPI("GET", "/puzzle", {}, {
    headers: {
        Authorization: "Bearer " + localStorage.getItem("NPToken"),
    },    
    params: getParams
   });

   puzzles = (getPuzzle.data.data ? getPuzzle.data.data : []);
   maxPage = (getPuzzle.data.pages ? getPuzzle.data.pages : 0);

  } catch (err) {
   alert(err);
   puzzles = [];
  }
 }

 onMount(() => {
    user.subscribe(val => {
        if (val.anonymous) {
            goto("/login");
        }
    })
    getPuzzle();
    offlineMode.subscribe(val => {
        offline = val;
    })
 });

 async function edit(puzzle_id: string, type: String) {
  goto("/board/edit/" + type + (puzzle_id != "" ? "?pid=" + puzzle_id : puzzle_id));
 }
 
 function nextPage() {
    getParams.page++;
    confirmRemove = 0;
    selectedId = "";
    getPuzzle();
 }

 function prevPage() {
    getParams.page--;
    selectedId = "";
    getPuzzle();
 }

 function jumpPage(pageTarget: number) {
    if (pageTarget < 0) {
        getParams.page = 1;
    } else if (pageTarget > maxPage) {
        getParams.page = maxPage;
    } else {
        getParams.page = pageTarget;
    }
    getPuzzle();
 }
 /*------- REMOVE BUTTON -------*/
 let selectedId: string = "";
 let confirmRemove: number = 0;

 function removeButtonClick(puzzle_id: string) {
    if (selectedId == puzzle_id) {
        if (confirmRemove == 1) {
            remove(puzzle_id);
        } else {
            confirmRemove ++;
        }        
    } else {
        confirmRemove = 0;
        selectedId = puzzle_id;
    }    
 }

 async function remove(puzzle_id: string) {
    try {
        await CallAPI("DELETE", "/puzzle/" + puzzle_id, {}, {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("NPToken"),
            }            
        });
        await getPuzzle();
        confirmRemove = 0;
        selectedId = "";
    } catch(err) {
        alert(err)
    }
 }

 /*------- NEW PUZZLE MODAL -------*/
 let newPuzzleModal: boolean = false;

</script>

<svelte:head>
  <title>NP My puzzle</title>
  <meta name="description" content="NP, Npuzzle, manage puzzle">
</svelte:head>


<main class="flex flex-col items-center max-w-[90vw] min-h-[90vh]" style="gap: 7px;">
 <h1 class="mb-10">Your Puzzle!</h1>
 <div class="pageMenu">
    <button disabled={offline} on:click={() => {newPuzzleModal = true}}>New Puzzle</button>
    <button disabled={getParams.page <= 1} on:click={() => {jumpPage(1);}} style="margin-left: auto;">{"<<"}</button>
    <button disabled={getParams.page <= 1} on:click={prevPage}>{"<"}</button>
    {#each new Array(5) as j, i}
        <button class="pageBtn" class:currPage={i == pageSubstract - 1} 
            on:click={() => {jumpPage(getParams.page - pageSubstract + i + 1);}}
            style="display: {((getParams.page - pageSubstract + i + 1 > maxPage)) ? "none" : ""};"
        >
            {getParams.page - pageSubstract + i + 1}
        </button>
    {/each}    
    <button disabled={puzzles.length < getParams.limit} on:click={nextPage}>></button>
    <button disabled={puzzles.length < getParams.limit} on:click={() => {jumpPage(maxPage);}}>>></button>
 </div>

 <table class="table-auto w-max-[90vw] w-[90vw]">
  <thead class="hidden sm:table-header-group">
   <tr>
    <th>No</th>
    <th>Type</th>
    <th>Puzzle ID</th>
    <th>Status</th>
    <th>Actions</th>
   </tr>
  </thead>
  <tbody>
   {#if puzzles.length !== 0}
    {#each puzzles as puzzle, i}
     <tr>
      <td class="text-center">{(getParams.page - 1)*getParams.limit + i + 1}</td>
      <td class="text-center"
       ><div class="flex justify-center items-center">
        <img src={puzzle.thumbnail} class="w-10 h-10 mr-2" alt="" />
        {puzzle.type}
       </div></td
      >
      <td class="text-center">
       {puzzle.puzzle_id}
      </td>
      <td class="text-center">puzzle status not recorded</td>
      <td class="text-center">
       <div class="flex justify-center items-center">
        <button disabled={offline} on:click={() => {edit(puzzle.puzzle_id, puzzle.type)}}>Edit</button>
        <button 
            class:warning={(selectedId == puzzle.puzzle_id) && (confirmRemove == 0)}
            class:danger={(selectedId == puzzle.puzzle_id) && (confirmRemove == 1)}
            on:click={() => {removeButtonClick(puzzle.puzzle_id)}}
        >
            {((selectedId == puzzle.puzzle_id) && (confirmRemove == 1) ? "Confirm" : "Remove")}
        </button>
       </div>
      </td>
     </tr>
    {/each}
   {:else}
    <tr>
     <td colspan="5"><strong>NO DATA</strong></td>
    </tr>
   {/if}
  </tbody>
 </table>

 <div class="pageMenu">
    <button disabled={getParams.page <= 1} on:click={() => {jumpPage(1);}} style="margin-left: auto;">{"<<"}</button>
    <button disabled={getParams.page <= 1} on:click={prevPage}>{"<"}</button>
    {#each new Array(5) as j, i}
        <button class="pageBtn" class:currPage={i == pageSubstract - 1} 
            on:click={() => {jumpPage(getParams.page - pageSubstract + i + 1);}}
            style="display: {((getParams.page - pageSubstract + i + 1 > maxPage)) ? "none" : ""};"
        >
            {getParams.page - pageSubstract + i + 1}
        </button>
    {/each}    
    <button disabled={puzzles.length < getParams.limit} on:click={nextPage}>></button>
    <button disabled={puzzles.length < getParams.limit} on:click={() => {jumpPage(maxPage);}}>>></button>
 </div>
</main>

{#if newPuzzleModal}
    <div class="modal">
        <div class="modalBackground" on:click={() => {newPuzzleModal = false;}}></div>

        <div class="newModalMenu bg-primary">
            <button class="primary bg-accent-2" on:click={() => {edit("", "Akari")}}>Akari</button>
            <button class="primary bg-accent-2" on:click={() => {edit("", "Sudoku")}}>Sudoku</button>
            <button class="primary bg-accent-2" on:click={() => {edit("", "Kakuro")}}>Kakuro</button>
            <button class="primary bg-accent-2" on:click={() => {edit("", "Slitherlink")}}>Slitherlink</button>
            <button class="primary bg-accent-2" on:click={() => {edit("", "Hashi")}}>Hashiwokakero</button>
            <button class="primary bg-accent-2" on:click={() => {edit("", "Futoshiki")}}>Futoshiki</button>
            <button class="primary bg-accent-2" on:click={() => {edit("", "Nurikabe")}}>Nurikabe</button>
        </div>
    </div>
{/if}

<style>
    button.warning {
        color: black;
        background-color: hsl(48, 100%, 67%);
    }

    button.danger {
        color: white;
        background-color: hsl(348, 100%, 61%);
    }

    button.primary {
        color: white;
    }

    button.pageBtn {
        border-radius: 50%;
        border: none;
        background-color: transparent;
    }

    button.pageBtn.currPage {
        border: 1px solid black;
    }

    button.pageBtn:hover {
        border: 1px dotted black;
    }

    div.pageMenu {
        width: 100%;
        display: flex;
        gap: 7px;
        align-items: center;
    }

    .modal {
        z-index: 1;
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .modalBackground {
        position: relative;
        width: 100%;
        height: 100%;
        background-color: black;
        opacity: 0.6;
    }

    .newModalMenu {
        position: fixed;
        top: 50%;
        left: 50%;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
        opacity: 1;
        border-radius: 10%;
        border: black 4px solid;
        max-width: 200px;
        width: 25%;
        display: flex;
        flex-direction: column;
        padding: 15px 5px 15px 5px;
    }
</style>
