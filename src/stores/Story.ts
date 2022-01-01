import { ActionSet } from "./Actions";

/**
 * The written out story.
 */
 export const story = {
  [ActionSet.BASE_ACTIONS]: {
    0: "You take a few steps forward until you hit a wall. It feels like rock.",
    1: "You punch the wall, but nothing happens. Oddly you dont even feel any pain.",
    2: "The darkness begins to fade and you see more clearly now. " +
    "Even though it's still pitch black, you can perfectly make out your surroundings. " +
    "It seems you're inside a cave of some sort.",
    3: "Observing the ground, you find some small rocks and bones scattered around.",
    4: "You feel an inexplicable urge to pick up the bones. Something is resonating within them…",
    5: "\"Why am I collecting useless rocks?\" Another unsolved question for now.",
    6: "After taking a few steps, you find yourself at a junction. \"Left or right?\"",
    // coin flip outcome should ideally be saved in localStorage and accessed here
    7: `You want fate to decide for you and flip an imaginary coin. The coin lands on ${Math.random() < 0.5 ? 'heads': 'tails'}.`,
    8: "You wake up. All you can see around you is black."
  },
  [ActionSet.CAVE_CHAMBER]: {
    0: "You decide on left. It felt like the safer option anyways. After some walking you end up in a large cave chamber.",
    1: "There's a huge metal gate embedded into the far side of the cave wall. You wonder what's behind it.",
    2: "Curious, you try to open the gate by pushing at it, but it won't budge.",
    3: "You try knocking on it, making an audible metal clank - but there's no response.",
  },
  [ActionSet.FOREST_VILLAGE]: {
    0: "Right it is. Venturing further you notice a faint light at the end of the tunnel. Feeling hopeful, you pursue it.",
    1: "After some fleeting thoughts about the afterlife you come back to your senses. As you exit the cave, it appears you are in a forest.",
    2: "You look at your hands, devoid of all flesh. Suddenly you realise your whole body is just a skeleton...",
    3: "Maybe you can use the resources you found inside the cave…",
    4: "Looking around, you decide to mow down some innocent trees. You know, wood is usually a starting resource in… nevermind. It's probably useful to build stuff.",
    5: "Even after death, bones retain some life force. As an undead yourself, you intuitively know this, so you distill some bones into essence and absorb their energy.",
    6: "You feel elated as you summon another one of yourself. Isn't it technically your child? Who knows, but it's perfect to do some work for you.",
  }
}