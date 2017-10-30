<template>
<div class="weather">
  <div v-if="data"><strong>Weather: </strong>{{data.main.temp}}℉, {{data.weather[0].main}}</div>
  <div v-else>No data available</div>
</div>
</template>

<script>
export default {
  props: ['data']
}
</script>

<style>
.weather {
  padding-top: 8px;
  font-size: 1.2em;
  text-align: right;
}
</style>
