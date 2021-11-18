<style>
    .outerContainer {
        background: var(--color, rgb(233, 233, 233));;
        height: 5px;
        width: var(--width, 4rem);;
        border-radius: .25rem;
        overflow: hidden;
        position: relative
    }
    .innerBar {
        background-color: #666666;
        height: inherit;
        width: var(--progress, 0);
        border-radius: inherit;
    }

    .barLabel {
        text-align: center;
        top: 0.25rem;
        left: 0;
        right: 0;
        position: absolute
    }
</style>

<div class="outerContainer">
    <div class="innerBar">
        <span class="barLabel">
            <slot></slot>
        </span>
    </div>
</div>
