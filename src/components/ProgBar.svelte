<style>
    .outerContainer .innerBar  {
      height: var(--height, 5px);
      /*border-radius: .25rem;*/
    }
    .outerContainer {
        background: var(--color, rgb(233, 233, 233));;
        width: var(--width, 4rem);;
        overflow: hidden;
        position: relative
    }
    .innerBar {
        background-color: #666666;
        width: var(--progress, 0);
        transition: width .25s ease-in-out;
        height: inherit
    }
    .barLabel {
        text-align: center;
        top: 0.25rem;
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

