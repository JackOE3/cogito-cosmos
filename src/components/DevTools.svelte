
<div id="devTools">
  <div id="devControls">
    <h1>Developer Tools</h1>
    <label for="DEV-ideas">change idea count</label>
    <input id="DEV-ideas" type="number" min=0 step=1 bind:value={ideas}>

    <span>add thoughts</span>
    <div style="display:flex;">
      <button on:click={() => thoughts += 1}>+1</button>
      <button on:click={() => thoughts += 10}>+10</button>
      <button on:click={() => thoughts += 100}>+100</button>
      <button on:click={() => thoughts += 1000}>+1K</button>
    </div>

    <span>add cheese</span>
    <div style="display:flex;">
      <button on:click={() => cheese += 1}>+1</button>
      <button on:click={() => cheese += 10}>+10</button>
      <button on:click={() => cheese += 100}>+100</button>
      <button on:click={() => cheese += 1000}>+1K</button>
    </div>

    <span>add moldy cheese</span>
    <div style="display:flex;">
      <button on:click={() => moldyCheese += 1}>+1</button>
      <button on:click={() => moldyCheese += 10}>+10</button>
      <button on:click={() => moldyCheese += 100}>+100</button>
      <button on:click={() => moldyCheese += 1000}>+1K</button>
    </div>

    <span>add cheese monster</span>
    <div style="display:flex;">
      <button on:click={() => cheeseMonster.amount += 1}>+1</button>
      <button on:click={() => cheeseMonster.amount += 10}>+10</button>
      <button on:click={() => cheeseMonster.amount += 100}>+100</button>
      <button on:click={() => cheeseMonster.amount += 1000}>+1K</button>
    </div>

  </div>
</div>

<style>
  #devTools {
    position: absolute;
    left: 0;
    top: 0;
    background-color: rgb(0,0,0,.8);
  }
  #devTools > #devControls {
    margin: 24px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>