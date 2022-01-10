<script lang="ts">
  // export let label: string[]
  // export let value: (number | string)[]
  // export let rate: string[] = []
  type row = {label: string, value: string | number, rate?: string}
  export let rows: row[]
  rows.forEach(row => {if (!row.rate) row.rate = "" })

</script>

<table>
  {#each rows as {label, value, rate}}
    <tr>
      <td class="label">
        &nbsp&nbsp {label}
      </td>
      <td class="value">{value}</td>
      <td class="rate">{rate}</td>
    </tr>
  {/each}
</table>

<style>
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  table tr td {
    font-weight: normal;
    text-align: start;
  }
  td.label {
    width: 45%;
  }
  td.value {
    width: 25%;
    text-align: right;
  }
  td.rate {
    text-align: right;
  }
</style>