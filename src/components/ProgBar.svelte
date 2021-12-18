<style>
  .outerContainer {
    height: var(--height, 5px);
    border-radius: .25rem;
  }
  .outerContainer {
      background: var(--barBgColor, #263238);
      width: var(--width, 4rem);
      overflow: hidden;
      position: relative;
  }
  .innerBar {
      background-color: var(--barColor, var(--primary));
      width: var(--progress, 0);
      /*transition: width .25s ease-in-out;*/
      transition: linear 0.2s;
      height: inherit;
      border-radius: inherit
  }
  .barLabel {
      text-align: center;
      top: 0.2rem;
      left: 0;
      right: 0;
      position: absolute
  }
</style>

<div>
  <div class="outerContainer">
    <div class="innerBar">
        <span class="barLabel">
            <slot></slot>
        </span>
    </div>
  </div>
</div>
