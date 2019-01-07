var fs = require('fs');

let files = fs.readdirSync('ft_fun');


let bigFile = {};

for (let i = 0; i < files.length; i++) {
	let contents = fs.readFileSync('ft_fun/'+files[i], 'utf8');

	let fileNumber = +contents.split('\n')[2].split('//file')[1];
	let fileCode = contents;
	
	bigFile[fileNumber] = fileCode;	
}

console.log(bigFile[1]);
bigFile.codeText = "";

for (let i = 1; i < files.length; i++) {
	bigFile.codeText += bigFile[i]+"\n";
}


// console.log(bigFile.codeText);