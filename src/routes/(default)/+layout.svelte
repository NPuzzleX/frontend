<script lang="ts">
 import Header from "../../components/header.svelte";
 import Footer from "../../components/footer.svelte";
</script>

<main class="dark:bg-d-primary bg-primary" style="display: flex; flex-direction:column; gap: 13px;">
 <Header class="" />
  <main
   class="container min-h-screen mx-auto flex flex-col items-center justify-center h-full"
  >
   <slot />
  </main>
 <Footer class="container mx-auto px-4" />
</main>
