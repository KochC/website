<template>
  <div class="one-pager">
    <div class="Landing">
      <h1>koch.codes</h1>
      <Version />
      <button v-scroll-to="'#impressum'">Impressum</button>
    </div>
  </div>
</template>

<script>

import Version from './Version.vue'

export default {
  name: 'Landing',
  props: {
    msg: String
  },
  components: {
    Version
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.Landing{
  box-shadow: 0 0 50pt rgba(0,0,0,0.125);
  border: 1px solid #2c3e50;
  transform: translate(-50%, -50%) rotate(2deg);
  position: relative;
  top: 50vh;
  left: 50vw;
  width: 200pt;
  transition: all 200ms;
  background-color: white;
}
.Landing:hover{
  transform: translate(-50%, -50%) rotate(-2deg);
}
@keyframes shake{
  0% {
    transform: translate(-50%, -50%) rotate(1deg);
  }
  50% {
    transform: translate(-49%, -50%) rotate(-1deg);
  }
  100% {
    transform: translate(-50%, -51%) rotate(1deg);
  }
}
.Landing > button{
  background: #222;
  width: 100%;
  border: 0;
  padding: 5pt;
  margin: 0;
  color: white;
  text-decoration: none;
  cursor: pointer;
}
.Landing > button:focus{
  border: 0;
  outline: none;
}
</style>
