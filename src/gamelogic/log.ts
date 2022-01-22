import { get, writable } from 'svelte/store';

/**
 * Svelte store to hold an array of messages
 */
export const logQueue = writable([] as LogEntry[])

/**
 * How many entries there are displayed at once.
 */
const MAX_LOG_LENGTH = 5

/**
 * Used to get a unique id for each message
 */
let idNumber = 0;

/**
 * Simple class to hold a string and an ID used to display messages to the player.
 * This could be expanded to include icons, sound effects, css classes for animations etc.
 */
class LogEntry {
  public entry: string;
  public id: number;

    constructor(entry: string) {
        this.entry = entry;
        this.id = idNumber++;
    }
}
// functional approach:
/*function LogEntry(entry: string){
  this.entry = entry
  this.id = idNumber++
}*/


export function addLogEntry(entry: string) {
    // create a message object
    const log = new LogEntry(entry);

    // add the message to the message queue
    logQueue.update(m => m = [...m, log]);

    // create a timeout to automatically remove the message after messageTime elapsed
    if (get(logQueue).length > MAX_LOG_LENGTH) {
      logQueue.update(m => {
        m.shift()
        return m
      });

    }
}



