<script lang="ts">
  export let min = 0
  export let max: number
  export let value: number
  export let onChange: Function
</script>

<input type=range min={min} max={max} bind:value={value} on:change={() => onChange()}>

<style>
  input[type=range] {
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: transparent;
  -webkit-appearance: none;
}
input[type=range]:focus {
  outline: none;
}
input[type=range]::-webkit-slider-runnable-track {
  background: var(--Gray800);
  border: 0;
  border-radius: 2.5px;
  width: 100%;
  height: 8px;
  cursor: pointer;
}
input[type=range]::-webkit-slider-thumb {
  margin-top: -8px;
  width: 24px;
  height: 24px;
  background: yellow;
  border: 0;
  border-radius: 3px;
  cursor: pointer;
  -webkit-appearance: none;
}
input[type=range]:focus::-webkit-slider-runnable-track {
  background: var(--Gray800);
}
input[type=range]::-moz-range-track {
  background: var(--Gray800);
  border: 0;
  border-radius: 2.5px;
  width: 100%;
  height: 8px;
  cursor: pointer;
}
input[type=range]::-moz-range-thumb {
  width: 24px;
  height: 24px;
  background: yellow;
  border: 0;
  border-radius: 3px;
  cursor: pointer;
}
input[type=range]::-ms-track {
  background: transparent;
  border-color: transparent;
  color: transparent;
  width: 100%;
  height: 8px;
  cursor: pointer;
}
input[type=range]::-ms-fill-lower {
  background: var(--Gray800);
  border: 0;
  border-radius: 5px;
}
input[type=range]::-ms-fill-upper {
  background: var(--Gray800);
  border: 0;
  border-radius: 5px;
}
input[type=range]::-ms-thumb {
  width: 24px;
  height: 24px;
  background: yellow;
  border: 0;
  border-radius: 3px;
  cursor: pointer;
  margin-top: 0px;
  /*Needed to keep the Edge thumb centred*/
}
input[type=range]:focus::-ms-fill-lower {
  background: var(--Gray800);
}
input[type=range]:focus::-ms-fill-upper {
  background: var(--Gray800);
}
/*TODO: Use one of the selectors from https://stackoverflow.com/a/20541859/7077589 and figure out
how to remove the virtical space around the range input in IE*/
@supports (-ms-ime-align:auto) {
  /* Pre-Chromium Edge only styles, selector taken from hhttps://stackoverflow.com/a/32202953/7077589 */
  input[type=range] {
    margin: 0;
    /*Edge starts the margin from the thumb, not the track as other browsers do*/
  }
}

</style>