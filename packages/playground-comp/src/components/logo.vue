<script setup>
import {ref} from "vue";
// import { plus } from "../utils/plus.js";
import {plus} from "@/utils/plus.js";

defineProps({
  msg: String,
});

const count = ref(0);

function add() {
  count.value = plus(count.value);
}
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="add">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
