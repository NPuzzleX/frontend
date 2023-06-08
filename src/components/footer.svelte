<script>
 const version = import.meta.env.VITE_APP_VERSION;
 import Kofilogo from "../assets/kofiLogo.webp";
 import GitHubLight from "../assets/GitHub-Mark-Light-64px.png"
</script>

<main id="footer" class="sticky top-0">
 <div class="bg-d-primary dark:bg-accent-1">
  <div class="container mx-auto px-4 py-4 flex justify-between items-center">
   <strong
    class="text-primary dark:text-d-primary opacity-80 hover:opacity-100"
   >
    Copyright 2022
   </strong>
    <a class="primary" style="margin-left:auto;" href="https://github.com/Npuzzlex" target="blank">
        <img alt="GitHub" src={GitHubLight} style="object-fit: scale-down; width: 32px; height: 32px;"/>
    </a>    
    <div class="item" style="flex-direction: row; justify-content:center; border:none;">
        <a class="primary bg-accent-2" style="display: flex; flex-direction: row; align-items:center" href="https://ko-fi.com/3mworkshop" target="blank">
            <img alt="KofiLogo" src={Kofilogo} height="32" width="32"/>
            Donate
        </a>
    </div>
    <strong
        class="text-primary dark:text-d-primary opacity-80 hover:opacity-100"
    >
       Version {version}
    </strong>
  </div>
 </div>
</main>

<style>
    div.item {
        border: black 2px solid;
        border-radius: 15px;
        display: flex;
        align-items: center;
        padding: 7px 13px 7px 13px;
    }

    a {
        border-radius: 7px;
        color: white;
        padding-right: 7px;
    }
</style>