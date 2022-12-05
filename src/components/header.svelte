<script lang="ts">
 import { goto } from "$app/navigation";
 import { user, nullUser } from "../stores";
 import logo from "../assets/logo.png"

 // ------------------ MENU ---------------
 var showMenu = false;
 function toggleMenu() {
  showMenu = !showMenu;
 }

 //------------- Logout -------------
 async function logout() {
  nullUser();
  return goto("/login");
 }

 let authenticated: boolean;
 user.subscribe((value) => {
  authenticated = !value.anonymous;
 });
</script>

<main id="header" class="sticky top-0 z-50">
 <div class="bg-d-primary dark:bg-accent-1">
  <div class="container mx-auto px-4 py-4 flex justify-between">
   <a href="/" style="display: flex;">
      <div class="flex items-center cursor-pointer">
         <img alt="Home" src={logo} height="32" width="32"/>
      </div>
         <strong
         class="ml-3 text-primary dark:text-d-primary hover:cursor-pointer opacity-80 hover:opacity-100"
         style="margin-right: auto;"
         >Home</strong>   
   </a>
   <!-- DESKTOP -->
   <div class="hidden md:flex">
    <ul class="inline-flex items-center">
     {#if authenticated}
     <li
       class="ml-10 text-primary dark:text-d-primary hover:cursor-pointer opacity-80 hover:opacity-100"
      >
      <a href="/acc">
         Account  
      </a>       
      </li>
      <li
       class="ml-10 text-primary dark:text-d-primary hover:cursor-pointer opacity-80 hover:opacity-100"
      >
      <a href="/my-puzzle">
       My Puzzle
      </a>
      </li>
      <li
       class="ml-10 text-primary dark:text-d-primary hover:cursor-pointer opacity-80 hover:opacity-100"
      >
         <a href="/about">
            About
         </a>
      </li>
      <li
       class="ml-10 text-primary dark:text-d-primary hover:cursor-pointer opacity-80 hover:opacity-100"
       on:click={logout}
      >
       Logout
      </li>
     {:else}
     <li
        class="ml-10 text-primary dark:text-d-primary hover:cursor-pointer opacity-80 hover:opacity-100"
      >
        <a href="/about">
         About
         </a>
     </li>
     <li
       class="ml-10 text-primary dark:text-d-primary hover:cursor-pointer opacity-80 hover:opacity-100"
      >
         <a href="/login">
            Login
         </a>
      </li>
     {/if}
    </ul>
   </div>
   <!-- MOBILE -->
   <div class="flex md:hidden items-center relative">
    <div class="space-y-2" on:click={toggleMenu}>
     <div class="w-8 h-0.5 bg-white dark:bg-slate-400" />
     <div class="w-8 h-0.5 bg-white dark:bg-slate-400" />
     <div class="w-8 h-0.5 bg-white dark:bg-slate-400" />
    </div>

    <!-- MENU -->
    {#if showMenu}
     <div class="fixed right-0 top-0 h-full w-full bg-black opacity-90" />
     <div
      class="fixed right-0 top-0 h-full w-2/3 bg-d-primary dark:bg-accent-1"
     >
      <div class="flex-col p-5 pl-10">
       <ul class="space-y-10">
        <li
         class="text-end text-primary dark:text-d-primary hover:cursor-pointer opacity-80 hover:opacity-100"
         on:click={toggleMenu}
        >
         X
        </li>
        {#if authenticated}
        <li
          class="text-primary dark:text-d-primary hover:cursor-pointer opacity-80 hover:opacity-100"
         >
          <a href="/acc">
            Account
          </a>          
         </li>
         <li
          class="text-primary dark:text-d-primary hover:cursor-pointer opacity-80 hover:opacity-100"
         >
          <a href="/my-puzzle">
            My Puzzle
          </a>
         </li>
         <li
          class="text-primary dark:text-d-primary hover:cursor-pointer opacity-80 hover:opacity-100"
         >
          <a href="/about">
           About
          </a>
         </li>
         <li
          class="text-primary dark:text-d-primary hover:cursor-pointer opacity-80 hover:opacity-100"
          on:click={logout}
         >
          Logout
         </li>
        {:else}
        <li
            class="text-primary dark:text-d-primary hover:cursor-pointer opacity-80 hover:opacity-100"
        >
         <a href="/about">
            About
         </a>         
        </li>
        <li
          class="text-primary dark:text-d-primary hover:cursor-pointer opacity-80 hover:opacity-100"
         >
          <a href="/login">
            Login
          </a>          
         </li>
        {/if}
        </ul>
      </div>
     </div>
    {/if}

    <!-- MENU END -->
   </div>
  </div>
  <!-- MOBILE END -->
 </div>
</main>
