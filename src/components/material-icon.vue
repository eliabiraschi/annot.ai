<template>
    <i class="material-icons" v-bind:style="{ fontSize: size + 'px' }">{{name}}</i>
</template>

<script>
    export default {
        props: ['name', 'size']
    }
</script>

<style>
/* @import url("https://fonts.googleapis.com/icon?family=Material+Icons"); */
@font-face {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  src: local('Material Icons'),
       local('MaterialIcons-Regular'),
       url('/static/fonts/MaterialIcons-Regular.woff2') format('woff2'),
       url('/static/fonts/MaterialIcons-Regular.woff') format('woff'),
       url('/static/fonts/MaterialIcons-Regular.ttf') format('truetype');
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  -moz-osx-font-smoothing: grayscale;
}
</style>