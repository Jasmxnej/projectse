<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { RouterView } from 'vue-router';

</script>

<template>
  <div class="w-screen min-h-screen overflow-hidden bg-[#f9fdfd]">
   
    <RouterView />
  </div>
</template>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
 
}


</style>
