import { writable } from 'svelte/store';

export const boneHarvester = writable({
  name: 'bone_harvester',
  employed: 0,
  generate: {
    bones: 0.25
  }
})
export const essenceGatherer = writable({
  name: 'bone_harvester',
  employed: 0,
  generate: {
    essence: 0.1
  }
})

