var fs = require('fs');
let files = fs.readdirSync('ft_fun');
let bigFile = {};

for (let i = 0; i < files.length; i++) {
	let contents = fs.readFileSync('ft_fun/'+files[i], 'utf8');
	let fileNumber = +contents.split('//file')[1];
	bigFile[fileNumber] = contents;
}

bigFile.codeText = "";

for (let i = 1; i <= files.length; i++) {
	bigFile.codeText += bigFile[i]+"\n";
}

fs.writeFile("fun.c", bigFile.codeText, (err) => {
    if(err) {
        return console.log(err);
    }
    console.log("The file complete!\n use 'gcc fun.c && ./a.out'");
});
