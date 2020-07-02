/** convert base m into n
 * @param {Number} num number to convert
 * @param {Int} base_from base of original number m
 * @param {Int} base_to target base n
 * @return {String} converted number e.g. "1ac"
 */
function convert_base(num, base_from, base_to){
	let temp = parseInt(num, base_from) // m -> 10
  return temp.toString(base_to) // m -> n
}

