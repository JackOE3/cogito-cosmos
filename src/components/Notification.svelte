<script>
  import { fly } from 'svelte/transition';
  import { sineInOut } from 'svelte/easing';
  import {Message} from '../gamelogic/notifications';
  export let message;
</script>

<!--
  Template for a single notification message
  transition:fly is used to animate the messages as they enter and exit the list
-->
<span transition:fly|local={{x: 200, duration : 500, easing: sineInOut}}>{message.message}</span>


<style>
  span {
      display: inline-block;
      padding: 1rem 2rem;
      border:1px solid #ccc;
      margin-bottom: 1rem;
      background-color: #eee;
  }
</style>