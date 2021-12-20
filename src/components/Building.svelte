<script>
  export let building
  export let cost
</script>

<div class="component">
  <b>{building.name}</b>
  <span>{building.level}</span>
  <button on:click={() => {
      if(building.cost(...cost)) building.level++
      else console.log("not enough resources!")
      }}>Upgrade</button>
</div>