var fs = require('fs');
/*
console.log('A');
var result = fs.readFileSync('./syntax/sample.txt', 'utf8');
console.log(result);
console.log('C');
*/

console.log('A');
fs.readFile('./syntax/sample.txt', 'utf8', (err, res) => {
    console.log(res);
});
console.log('C');
