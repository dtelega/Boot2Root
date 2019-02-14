// Avance [int steps]  - forward          1466
// Recule [int steps] - back                 8
// Tourne droite [int angle] - right turn  732
// Tourne gauche [int angle] - left turn  724

const NAMES = {
    FD: 'forward',
    RT: 'right',
    LT: 'left'
};

const fs = require('fs');

try {
    const fileName = process.argv[2];
    const file = fs.readFileSync(fileName).toString();

    let fileContent = file.split('\n');

    fileContent = fileContent.filter(line => {
        return line.toLocaleLowerCase().includes('avance') ||
            line.toLocaleLowerCase().includes('recule') ||
            line.toLocaleLowerCase().includes('tourne');
    });

    let resCommands = "";
    fileContent.forEach(line => {
        if (line.toLocaleLowerCase().includes('avance')) {
            const steps = Number(line.split(' ')[1]);
            resCommands += `${NAMES.FD}(${steps});\n`;
        } else if (line.toLocaleLowerCase().includes('recule')) {
            const steps = Number(line.split(' ')[1]);

            resCommands += `${NAMES.RT}(180); ${NAMES.FD}(${steps}); ${NAMES.RT}(180);\n`;
        } else if (line.toLocaleLowerCase().includes('tourne')) {
            const angle = Number(line.split(' ')[3]);
            const side = line.split(' ')[1] === 'gauche' ? NAMES.LT : NAMES.RT;

            resCommands += `${side}(${angle});\n`;
        }
    });

    fs.writeFile("translated-cmd.js", resCommands, (err) => {
        if(err) {
            return console.log(err);
        }
        console.log('file complete');
    });


} catch (e) {
    console.log('Error =(\n', e);
}


