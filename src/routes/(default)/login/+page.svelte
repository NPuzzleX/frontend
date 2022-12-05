<script lang="ts">
 import { onMount } from "svelte";
 import { goto } from "$app/navigation";
 import CallAPI from "../../../helpers/axios";
 import { user } from "../../../stores";

 import {
  GoogleAuthProvider,
  getAuth,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
 } from "firebase/auth";

 const auth = getAuth();
 const provider = new GoogleAuthProvider();

 //  AXIOS FUNCTIONS
 async function fetchUser(token: String) {
  return await CallAPI(
   "GET",
   "/account",
   {},
   { 
    headers: {
      Authorization: "Bearer " + token
    }
    }
  );
 }

  async function processLogin(paramObject: Object): Promise<void> {
    //  AXIOS LOGIN
    const api = await CallAPI("GET", "/account/login", {}, { params: paramObject});
    localStorage.setItem("NPToken", api.data.token);

    //  AXIOS GET USER
    const getUser = await fetchUser(api.data.token);

    //  REDIRECT
    user.set({
      token: api.data.token,
      ...getUser.data,
      anonymous: false
    });
    localStorage.setItem(
      "NPUserData",
      JSON.stringify({
        ...getUser.data,
      })
    );
  }

 function googleSignInBtn() {
  if (navigator.userAgent.indexOf("Firefox") != -1) {
   signInWithPopup(auth, provider)
    .then((res) => {
     const cred = GoogleAuthProvider.credentialFromResult(res);
     if (cred) {
      signInWithCredential(auth, cred)
       .then(async (res2) => {
        const ftkn = await auth.currentUser?.getIdToken();
        await processLogin({ ftkn: ftkn });
        goto(`/acc`, { replaceState: false });
       })
       .catch((err) => {
        console.log("ERR " + err);
       });
     }
    })
    .catch((err) => {
     if (err.code == "auth/popup-closed-by-user") {
      console.log("sign in cancelled by user");
     }
    });
  } else {
   signInWithRedirect(auth, provider);
  }
 }

 //------------- Sign in with email and pass -------------
 let email: string = "";
 let pass: string = "";
 let passConfirm: string = "";
 async function passSignUpBtn() {
  if (pass != passConfirm) {
   pass = "";
   passConfirm = "";
  } else {
   try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const ftkn = await auth.currentUser?.getIdToken();
    await processLogin({ ftkn: ftkn });
    goto(`/acc`, { replaceState: false });
   } catch (err) {
    console.log("ERR " + err);
   }
  }
 }

 //------------- Log in with email and pass -------------
 let email2: string = "";
 let pass2: string = "";
 async function passSignInBtn() {
  try {
   await signInWithEmailAndPassword(auth, email2, pass2);
   const ftkn = await auth.currentUser?.getIdToken();
   await processLogin({ ftkn: ftkn });
   goto(`/acc`, { replaceState: false });
  } catch (err) {
   console.log("ERR " + err);
  }
 }

 onMount(() => {
  getRedirectResult(auth)
   .then((res) => {
    if (res) {
     const cred = GoogleAuthProvider.credentialFromResult(res);
     if (cred) {
      signInWithCredential(auth, cred)
       .then(async (res2) => {
        const ftkn = await auth.currentUser?.getIdToken();
        await processLogin({ ftkn: ftkn });
        goto(`/acc`, { replaceState: false });
       })
       .catch((err) => {
        console.log("ERR " + err);
       });
     }
    }
   })
   .catch((err) => {
    console.log(err);
   });
 });
</script>

<svelte:head>
  <title>NP login</title>
  <meta name="description" content="NP, NPuzzle, login, sign up, sign in">
</svelte:head>


<main class="flex flex-col items-center max-w-[90vw]">
 <div class="flex flex-col lg:flex-row w-[900px] max-w-[90vw]">
  <div class="border-container ">
   <h2 class="mx-auto">SIGN IN</h2>
   Email
   <input bind:value={email2} />
   Password
   <input bind:value={pass2} type="password" />
   <button class="pass" on:click={passSignInBtn}>LOGIN</button>
   <h4 class="mx-auto">or</h4>
   <button
    class="dark:bg-red-700 bg-red-700 dark:hover:bg-red-500 hover:bg-red-500 text-white"
    on:click={googleSignInBtn}>LOGIN WITH GOOGLE</button
   >
  </div>
  <div class="border-container">
   <h2 class="mx-auto">SIGN UP</h2>
   Email
   <input bind:value={email} />
   Password
   <input bind:value={pass} type="password" />
   Password Confirm
   <input bind:value={passConfirm} type="password" />
   <button class="pass" on:click={passSignUpBtn}>SIGN UP</button>

   <h4 class="mx-auto">or</h4>
   <button
    class="dark:bg-red-700 bg-red-700 dark:hover:bg-red-500 hover:bg-red-500 text-white"
    on:click={googleSignInBtn}>SIGNUP WITH GOOGLE</button
   >
  </div>
 </div>

 <div class="container" />
</main>

<style scoped>
</style>
