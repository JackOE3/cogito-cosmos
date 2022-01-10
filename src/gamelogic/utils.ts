const thousand = 1_000;
const million = 1_000_000;
const billion = 1_000_000_000;
const trillion = 1_000_000_000_000;
const quadrilion = trillion * 1000;
const quintilion = quadrilion * 1000;
const sextilion = quintilion * 1000;

/**
 * Function to format a number for display on screen.
 * @param input Number to format
 * @param decimals How many decimals do you want
 */
export function formatNumber(input: number, decimals: number) {
  if (!input) input = 0;
  if (input < 0) return "-" + formatNumber(-1 * input, decimals);
  if (input >= quadrilion)
      return input.toExponential(decimals).replace("+", "");
  if (input >= trillion)
      return (input / trillion).toFixed(decimals) + 'T';
  if (input >= billion)
      return (input / billion).toFixed(decimals) + 'B';
  if (input >= million)
      return (input / million).toFixed(decimals) + 'M';
  if (input >= thousand)
      return (input / thousand).toFixed(decimals) + 'K';

  return input.toFixed(decimals);
}
 export function formatNumber2(input: number, decimals: number) {
  if (!input) input = 0;
  if (input < 0) return "-" + formatNumber(-1 * input, decimals);
  if (input >= sextilion)
      return input.toExponential(decimals).replace("+", "");
  if (input >= quintilion)
    return (input / quintilion).toFixed(decimals) + ' E';
  if (input >= quadrilion)
    return (input / quadrilion).toFixed(decimals) + ' P';
  if (input >= trillion)
      return (input / trillion).toFixed(decimals) + ' T';
  if (input >= billion)
      return (input / billion).toFixed(decimals) + ' G';
  if (input >= million)
      return (input / million).toFixed(decimals) + ' M';
  if (input >= thousand)
      return (input / thousand).toFixed(decimals) + ' k';

  return input.toFixed(decimals);
}

/**
* Function to format a number for display on screen.
* Will only show decimal places when the number is abbreviated.
* @param input Number to format
*/
export function formatWhole(input: number) {
  if (!input) input = 0;
  if (input < 0) return "-" + formatWhole(-1 * input);
  if (input < thousand) return formatNumber(input, 0);
  return formatNumber(input, 2);
}

/**
 * Removes all references to an object or variable.
 * @param obj 
 * @returns real copy of obj
 */
export const noRef = (obj: any) => {return JSON.parse(JSON.stringify(obj))}


/**
 * Only executes a function once.
 * @param fn function to be executed
 * @param context 
 * @returns 
 */
export function once(fn: Function, context) { 
	var result: Function;
	return function() { 
		if(fn) {
			result = fn.apply(context || this, arguments);
			fn = null;
		}
		return result;
	};
}