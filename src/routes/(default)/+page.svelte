<script lang="ts">
    import CallAPI from "../../helpers/axios";
    import { getDBbyId, writeDB, deleteDB, getPageDB } from "../../helpers/indexdb";
    import { onMount } from "svelte";
    import PuzzleCard from "../../components/puzzle-card.svelte";
    import { user, offlineMode } from "../../stores"
   
    var getParams = {
     page: 1,
     limit: 15,
     self: 0
    };
    var puzzles: any[] = [];
    let loggedIn: boolean = false;
    let maxPage: number = 0;
    let cacheAccess: boolean = (caches ? true : false);
    let offline: boolean = false;
   
    $: pageSubstract = Math.min(getParams.page, 3);
   
    async function getPuzzle(): Promise<void> {
       if (offline) {
           puzzles = [];
           const res = await getPageDB("saved_puzzles", getParams);
           maxPage = res.pages;
           puzzles = res.data;
       } else {
           try {
               const getPuzzle = await CallAPI("GET", "/puzzle", {}, {
                   headers: {
                       Authorization: "Bearer " + localStorage.getItem("NPToken"),
                   },    
                   params: getParams
               });
   
               puzzles = (getPuzzle.data.data ? getPuzzle.data.data : []);
               maxPage = (getPuzzle.data.pages ? getPuzzle.data.pages : 0);
      
               for(let i = 0; i < puzzles.length; i++) {
                   puzzles[i].saved = false;
                   getDBbyId("saved_puzzles", puzzles[i].puzzle_id, "").then((res) => {
                       if (res) {
                           puzzles[i].saved = true;
                       } else {
                           puzzles[i].saved = false;
                       }
                   });
               }
           } catch (err) {
               alert(err);
               puzzles = [];
           }
       }
    }
   
    onMount(async () => {
       user.subscribe((val) => {
           loggedIn = !val.anonymous;
       })
       offlineMode.subscribe(async (val) => {
           offline = val;
           if (offline) {
               getParams.page = 1;
           }
           await getPuzzle();
       })
    });
   
    async function nextPage() {
       getParams.page++;
       await getPuzzle();
       window.scroll({
           top:0,
           behavior: 'smooth'
       });
    }
   
    async function prevPage() {
       getParams.page--;
       await getPuzzle();
       window.scroll({
           top:0,
           behavior: 'smooth'
       });
    }
    
    async function jumpPage(pageTarget: number) {
       if (pageTarget < 0) {
           getParams.page = 1;
       } else if (pageTarget > maxPage) {
           getParams.page = maxPage;
       } else {
           getParams.page = pageTarget;
       }
       await getPuzzle();
       window.scroll({
           top:0,
           behavior: 'smooth'
       });
    }
   
    async function triggerDownload(idx: number) {
       if (puzzles[idx].saved) {
           await deleteDB("saved_puzzles", puzzles[idx].puzzle_id);
       } else {
           try {
               let res = await CallAPI("GET", "/puzzle/" + puzzles[idx].puzzle_id, {},  
               {
                   headers: {
                       "Authorization" : "Bearer " + localStorage.getItem("NPToken")
                   }   
               });
               await writeDB("saved_puzzles", {
                   game: res.data.data,
                   ...puzzles[idx]
               });
           } catch (error) {
               alert(error);
               return;            
           }
       }
       puzzles[idx].saved = !puzzles[idx].saved;
    }
   </script>
   
   <svelte:head>
       <title>NPuzzle</title>
       <meta name="description" content="Online puzzle with scribble board, akari, slitherlink, kakuro, bijutukan, sudoku, 9x9, 16x16, 25x25, 36x36, 49x49">
   </svelte:head>
   
   <main class="flex flex-col items-center max-w-[90vw] min-h-[90vh] ">
    <div class="headDiv">
        <h1>Welcome to NPuzzle!!</h1>
        <h5>Community driven puzzle website with scribble board!</h5>
        <h5>Got a good puzzle you want to share? You can <a href="/my-puzzle">submit here</a> (need login)!</h5>
    </div>
    
    <div class="grid gap-5 lg:grid-cols-3 w-full max-w-[90vw]">
     {#if puzzles.length !== 0}
      {#each puzzles as puzzle, idx}
       <PuzzleCard 
         data={puzzle} loggedIn={loggedIn} cacheAccess={cacheAccess} offline={offline}
         on:triggerFav={() => {puzzle.favourited = !puzzle.favourited}}
         on:triggerDownload={() => {triggerDownload(idx);}}
       />
      {/each}
     {:else}
      <div class="border-container text-center">NO DATA</div>
     {/if}
    </div>
    <div class="container" />
    <div class="pageMenu">
       <button disabled={getParams.page <= 1} on:click={() => {jumpPage(1);}}>{"<<"}</button>
       <button disabled={getParams.page <= 1} on:click={prevPage}>{"<"}</button>
       {#each new Array(5) as j, i}
           <button class="pageBtn" class:currPage={i == pageSubstract - 1} 
               on:click={() => {jumpPage(getParams.page - pageSubstract + i + 1);}}
               style="display: {((getParams.page - pageSubstract + i + 1 > maxPage)) ? "none" : ""};"
           >
               {getParams.page - pageSubstract + i + 1}
           </button>
       {/each}    
       <button disabled={puzzles.length < getParams.limit} on:click={nextPage}></button>
       <button disabled={puzzles.length < getParams.limit} on:click={() => {jumpPage(maxPage);}}></button>
    </div>
   </main>
   
   <style>
        .headDiv {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            margin-bottom: 13px;
        }

        .headDiv a {
            font-weight: bolder;
            color: blue;
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
           justify-content: center;
       }
   </style>
   