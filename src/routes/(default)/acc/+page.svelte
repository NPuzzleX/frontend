<script lang="ts">
 import { onMount } from "svelte";
 import { goto } from "$app/navigation";
 import { user } from "../../../stores";
 import CallAPI from "../../../helpers/axios";

 import {
  GoogleAuthProvider,
  getAuth,
  linkWithPopup,
  linkWithRedirect,
  EmailAuthProvider,
  linkWithCredential,
  getRedirectResult,
  unlink,
 } from "firebase/auth";

 const auth = getAuth();
 const provider = new GoogleAuthProvider();
 let providerTypes: string[] = [];
 let alertModal: boolean = false;

 var userData: any;
 user.subscribe((value) => {
  userData = value;
 });

 //------------- GOOGLE LINKING -------------
 function googleLinkBtn() {
  const tempUser = auth.currentUser;
  if (navigator.userAgent.indexOf("Firefox") != -1) {
   if (tempUser) {
    linkWithPopup(tempUser, provider)
     .then((res) => {
      const cred = GoogleAuthProvider.credentialFromResult(res);
      if (cred) {
       console.log("LINKING OK");
       if (auth.currentUser) {
        providerTypes = auth.currentUser.providerData.map((e) => {
         return e.providerId;
        });
       }
      }
     })
     .catch((err) => {
      if (err.code == "auth/popup-closed-by-user") {
       console.log("sign in cancelled by user");
      }
     });
   }
  } else {
   if (tempUser) {
    linkWithRedirect(tempUser, provider);
   }
  }
 }

 //------------- PASS + EMAIL LINKING -------------
 let email: string = "";
 let pass: string = "";
 let passConfirm: string = "";
 function passLinkBtn() {
  if (pass != passConfirm) {
   pass = "";
   passConfirm = "";
  } else {
   const cred = EmailAuthProvider.credential(email, pass);
   const tempUser = auth.currentUser;
   if (tempUser) {
    linkWithCredential(tempUser, cred)
     .then((res) => {
      console.log("LINKING WITH PASS + EMAIL OK");
      if (auth.currentUser) {
       providerTypes = auth.currentUser.providerData.map((e) => {
        return e.providerId;
       });
      }
     })
     .catch((err) => {
      console.log(err);
     });
   }
  }
 }

 //------------- UNLINKING -------------
 function unlinkBtn(providerId: string) {
  const tempUser = auth.currentUser;
  if (tempUser) {
   unlink(tempUser, providerId)
    .then(() => {
     console.log("Success unlinking " + providerId);
     if (auth.currentUser) {
      providerTypes = auth.currentUser.providerData.map((e) => {
       return e.providerId;
      });
     }
    })
    .catch((err) => {
     console.log(err);
    });
  }
 }

 //  ---------------- Change Username --------------
 let tempUsername: String;
 async function changeUsername() {
  if (tempUsername == userData.username) {
    return;
  }

  try {
   const changeUsername = await CallAPI(
    "POST",
    "/account",
    { username: tempUsername },
    { 
      headers: {
        Authorization: "Bearer " + userData.token
      }
    }
   );

   const getUser = await CallAPI(
    "GET",
    "/account",
    {},
    { 
      headers: {
        Authorization: "Bearer " + userData.token
      }
    }
   );

   //  REDIRECT
   user.set({ token: userData.token, ...getUser.data });
   localStorage.setItem("NPUserData", JSON.stringify({ ...getUser.data }));
   alertModal = true;
  } catch (err) {
   alert(err);
  }
 }

 onMount(() => {
  tempUsername = userData.username;
  if (auth.currentUser) {
   providerTypes = auth.currentUser.providerData.map((e) => {
    return e.providerId;
   });
   getRedirectResult(auth)
    .then((res) => {
     if (res) {
      const cred = GoogleAuthProvider.credentialFromResult(res);
      if (cred) {
       console.log("LINKING GOOGLE OK");
      }
     }
    })
    .catch((err) => {
     console.log(err);
    });
  } else {
   if (userData.token) {
   } else {
    goto("/login", { replaceState: false });
   }
  }
 });
</script>

<svelte:head>
  <title>NP Account</title>
  <meta name="description" content="NP, Npuzzle, account">
</svelte:head>


<main class="flex flex-col items-center min-h-[90vh] w-full max-w-[90vw] py-14">
 <h1><strong class="w-full text-center"> Hi, {userData.username}</strong></h1>

 <!-- ACCOUNT SETTINGS -->
 <h1 class="my-10 text-center">Account Settings</h1>
 <div class="flex flex-col lg:flex-row w-[900px] max-w-[90vw]">
  <div class="border-container">
   <h2 class="mx-auto text-center">Account options for multiple linking</h2>
   {#if providerTypes.includes("google.com")}
    <h3>Already logged in with google</h3>
    {#if providerTypes.length > 1}
     <button class="cancel" on:click={() => unlinkBtn("google.com")}
      >UNLINK</button
     >
    {/if}
   {:else}
    <button
     class="dark:bg-red-700 bg-red-700 dark:hover:bg-red-500 hover:bg-red-500 text-white mt-5"
     on:click={googleLinkBtn}>LINK GOOGLE ACCOUNT</button
    >
   {/if}
  </div>
  <div class="border-container">
   <h2 class="mx-auto text-center">Link separate email</h2>
   {#if providerTypes.includes("password")}
    <h3 class="text-center">Already linked</h3>
    {#if providerTypes.length > 1}
     <button class="cancel" on:click={() => unlinkBtn("password")}
      >UNLINK</button
     >
    {/if}
   {:else}
    Email
    <input bind:value={email} />
    Password
    <input bind:value={pass} type="password" />
    Password Confirm
    <input bind:value={passConfirm} type="password" />
    <button
     class="dark:bg-red-700 bg-red-700 dark:hover:bg-red-500 hover:bg-red-500 text-white mt-5"
     on:click={passLinkBtn}>Link Email</button
    >
   {/if}
  </div>
 </div>
 <!-- ACCOUNT END -->

 <!-- ACCOUNT STATUS -->
 <h1 class="my-10 text-center">Account Status</h1>
 <div class="flex flex-col lg:flex-row w-[900px] max-w-[90vw]">
  <div class="border-container">
   <h2 class="mx-auto text-center">Completed Puzzles</h2>
   <h3 class="mx-auto">{userData.countCompleted}</h3>
  </div>
  <div class="border-container">
   <h2 class="mx-auto text-center">Incomplete Puzzles</h2>
   <h3 class="mx-auto">{userData.countUncompleted}</h3>
  </div>
  <div class="border-container">
   <h2 class="mx-auto text-center">Favorited Puzzles</h2>
   <h3 class="mx-auto">{userData.countFavorites ?? 0}</h3>
  </div>
  <div class="border-container">
   <h2 class="mx-auto text-center">My Puzzles</h2>
   <h3 class="mx-auto">{userData.countMyPuzzles}</h3>
  </div>
 </div>
 <!-- ACCOUNT STATUS END -->

 <!-- ACCOUNT INFO SETTING -->
 <h1 class="my-10 text-center">Account Info Settings</h1>
 <div class="flex flex-col lg:flex-row w-[900px] max-w-[90vw]">
  <div class="border-container">
   Username
   <input bind:value={tempUsername} />
   <button
    class="dark:bg-red-700 bg-red-700 dark:hover:bg-red-500 hover:bg-red-500 text-white mt-5"
    on:click={changeUsername}>Submit Changes</button
   >
  </div>
 </div>
 <!-- ACCOUNT INFO SETTING END -->

 {#if alertModal}
 <div class="modal">
     <div class="modalBackground" on:click={() => {alertModal = false;}}></div>
 
     <div class="newModalMenu bg-primary">
      <h1 style="text-align:center;">Change Saved!</h1>
    </div>
 </div>
 {/if}    
</main>

<style>
    .modal {
        z-index: 1;
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .modalBackground {
        position: fixed;
        width: 100%;
        height: 120%;
        background-color: black;
        top: -20%;
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
</style>
