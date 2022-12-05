<script lang="ts">
 import Header from "../../../../../components/header.svelte";
 import Footer from "../../../../../components/footer.svelte";
 import { nullUser } from "../../../../../stores"
 import { onMount } from "svelte";
 import CallAPI from "../../../../../helpers/axios";
 import { updateDBbyId } from "../../../../../helpers/indexdb";
 import { goto, beforeNavigate } from "$app/navigation";
 import { page } from '$app/stores';
 import * as iconList from '../../../../../helpers/iconList';

 import "./colorScheme1.css";

 const remoteAddr = import.meta.env.VITE_remoteEntryAddr;
 let autoSaver: any = null;
 let boardHeight: number = 100;
 let fullScreen: boolean = false;
 
 export let data: any;

 let mountBoard = async () => {
  const sourceTarget : string = remoteAddr ? data.ptype.toLowerCase() + (data.mode == "play" ? "Play" : "Edit") : "fe_app";

  try {
   // @ts-ignore
   window[sourceTarget].get("./Board").then((module: any) => {
    const Board = module().default;
    new Board({
     target: document.getElementById("np-board"),
    });
   });
  } catch (err) {
   console.log(err);
    goto(`/`, { replaceState: false });
  }
 };

 onMount(() => {
  const pid = $page.url.searchParams.get("pid");
  if (pid) {
    sessionStorage.setItem("PuzzleId", pid);
  } else {
    sessionStorage.removeItem("PuzzleId");
  }

  if (data.mode == "play") {
    autoSaver = setInterval(() => {
    if (sessionStorage.getItem("save") == "Y") {
      saveState(false);
      sessionStorage.removeItem("save");
    }
    }, 30*1000)
  }

  boardHeight = (document.getElementById("header")?.clientHeight ?? 0) + (document.getElementById("footer")?.clientHeight ?? 0);

  window.addEventListener("message", messageNexus);
 });

 beforeNavigate(() => {
  if (data.mode == "play") {
    if (autoSaver) {
      clearTimeout(autoSaver);
    }
    saveState(true);
  }
  window.removeEventListener("message", messageNexus);
 })

 function beforeUnload() {
  if (data.mode == "play") {
    saveState(true);
  }  
 }

 async function saveState(clear: boolean) {
  let parsedState = sessionStorage.getItem("TEMPSTATE");
  if (parsedState && sessionStorage.getItem("PuzzleId")) {
    try {
      parsedState = JSON.parse(parsedState);
      const puzzle_id = sessionStorage.getItem("PuzzleId");
      if (clear) {
        sessionStorage.removeItem("PuzzleId")
      }

      await CallAPI("POST", "/puzzle/state",
        {
          "puzzle_id" : puzzle_id,
          "data": {
            "cvs": sessionStorage.getItem("TEMPSCRIBBLE"),
            "game": parsedState
          }
        },    
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("NPToken"),
          }          
        }
      );
    } catch (error) {
      console.log(error);
    }
  }
 }

 function messageNexus(event: MessageEvent) {
  if ((event.isTrusted) && (event.origin === window.origin)) {
    if (event.data == "UPLOADED NEW PUZZLE") {
      alertModal = true;
      modalClosable = false;
      alertText = "PUZZLE UPLOADED!";
      modalType = 2;
      setTimeout(() => {
        goto("/my-puzzle");
      }, 3000)
    } else if (event.data == "INVALID PUZZLE_ID") { 
      modalType = 0;
      triggerAlert("INVALID PUZZLE ID");
    } else if (event.data == "INVALID TOKEN") {
      modalType = 1;
      nullUser();
      triggerAlert("SESSION TIMEOUT");
    } else if (event.data == "PUZZLE DONE!") {
      const pid = sessionStorage.getItem("PuzzleId");
      if (pid) {
        updateDBbyId("saved_puzzles", pid , { completed: true });
      }      
      modalType = 3;
      triggerAlert("CONGRATS! PUZZLE DONE!");
    } else if (event.data == "ERROR CHECKING ANSWER") {
      modalType = 0;
      modalClosable = true;
      alertText = "UNABLE TO REACH SERVER FOR CHECKING ANSWER";
      alertModal = true;
    } else if (event.data == "TRIGGER FULLSCREEN") {
      fullScreen = !fullScreen;
    }
  }
 }
 
 function optionBtnClick() {
  const target = document.getElementById("optionBoard");
  if (target) {
    if (target.style.display == "") {
      target.style.display = "none";
    } else {
      target.style.display = "";
    }
  }
 }

 /*------- ALERT MODAL -------*/
 let alertModal: boolean = false;
 let alertText: string = "PUZZLE UPLOADED!";
 let modalClosable: boolean = false;
 let modalType: number = 0;
 /*
  0: Error
  1: Session timeout
  2: uploaded puzzle
  3: puzzle done
 */

 function triggerAlert(textContent: string) {
  alertModal = true;
  modalClosable = false;
  alertText = textContent;
  setTimeout(() => {
    goto("/")
  }, 3000)
 }

 function modalBackgroundClick() {
  if (modalClosable) {
    alertModal = false;
  }
 }
</script>

<svelte:window  on:beforeunload={beforeUnload}/>
<svelte:head>
  <title>{"NP " + data.mode + " " + data.ptype}</title>
  <meta name="description" content={"NP, Npuzzle, " + data.mode + " " + data.ptype}>
    
 <script
  on:load={mountBoard}
  data-webpack={data.ptype.toLowerCase() + (data.mode == "play" ? "Play" : "Edit")}
  src={(remoteAddr
   ? remoteAddr + "/" + data.ptype + "/" + data.mode
   : "http://localhost:8080") + "/master.js"}></script>
</svelte:head>

<main 
 style="display: flex; flex-direction: column; height: 100vh; width: 100vw;"
 class="dark:bg-d-primary bg-primary"
>
 {#if !fullScreen} 
  <Header/>
 {/if}
 <div id="np-board" style="height: {fullScreen ? "100vh" : "calc(100vh - " + boardHeight + "px)"};padding: 10px;">
  <button id="menuBtn" on:click={optionBtnClick} title="Menu"><div class="icon">{@html iconList.gearIco}</div></button>
 </div>
 {#if alertModal}
 <div class="modal">
     <div class="modalBackground" on:click={modalBackgroundClick}></div>

     <div class="newModalMenu bg-primary">
      <h1 style="text-align:center;">{alertText}</h1>
    </div>
 </div>
 {/if}

{#if !fullScreen} 
<Footer/>
{/if}
</main>

<style>
  .modal {
      z-index: 6;
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
      padding: 15px 7px 15px 7px;
  }

  #menuBtn {
    position: absolute;
    right: 13px;
    border: none;
    background-color: transparent;
    z-index: 10;
    opacity: 0.5;
  }

  /* SVG CONTROL */
  .icon {
    width: 5vw;
    max-width: 30px;
  }
</style>