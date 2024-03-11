<template>
  <div id="app">
    <Landing />
    <Impressum />
    <particles-bg type="cobweb" :bg="true" />
  </div>
</template>

<script>
import Landing from './components/Landing.vue';
import Impressum from './components/Impressum.vue';
import { ParticlesBg } from "particles-bg-vue";

export default {
  name: 'App',
  components: {
    Landing,
    Impressum,
    ParticlesBg
  },
}
</script>

<style>
html, body{
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #222;
  margin-top: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
}
.one-pager{
  min-height: 100vh;
}
.dark{
  background: #222;
  color: white;
}
*bg{
  position: "absolute";
  zIndex: -1;
  top: 0;
  left: 0;
}
</style>
