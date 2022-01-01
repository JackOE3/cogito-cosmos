<style>
  .outerContainer {
    height: var(--height, 5px);
    border-radius: .25rem;
  }
  .outerContainer {
      background: var(--barBgColor, var(--Gray900));
      width: var(--width, 4rem);
      overflow: hidden;
      position: relative;
  }
  .innerBar {
      background-color: var(--barColor, var(--secondary));
      width: var(--progress, 0);
      /*transition: width .25s ease-in-out;*/
      transition: linear 0.2s;
      height: inherit;
      border-radius: inherit;
  }
  .barLabel {
    position: absolute;
    text-align: center;
    font-size: 1rem;
    left: 0;
    right: 0;
    top: calc(var(--height)/2 - 0.65rem);
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
