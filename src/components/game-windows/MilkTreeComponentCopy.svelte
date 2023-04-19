<script lang="ts">
  import { WindowId, resource } from '@store'
  import Window from './window-model/Window.svelte'
  import { formatNumber } from '@gamelogic/utils'

  export let windowId: WindowId
</script>

<Window title="The Milk Tree" themeColor1="#bdbdbd" themeColor2="#ffffff" {windowId}>
  <div>
    <span class="resourceDisplay"
      >You have {formatNumber($resource.milkPoints, 2)} unspent <strong style="color:white"> milk points</strong> <br />
    </span>
    <span>Total: {16}</span>
  </div>
</Window>

<style>
</style>
