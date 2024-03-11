<template>
    <div class="Version">
      Build v{{v}}
    </div>
</template>

<script>
import { build_version } from "./version";

export default {
  name: 'Version',
  data: function(){
      return {
          v: build_version,
      }
  },
  base: '/website/',
  created: function(){
      console.log(this.v);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.Version{
    font-size: 70%;
    margin-top: -1rem;
}
</style>
