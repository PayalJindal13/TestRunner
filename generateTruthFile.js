const fileName = 'C:\\Work\\diskann\\GenerateGroundTruth.exe'
const childProcess = require('child_process')

module.exports = generateTruthFile = (params) => {
  return new Promise((res, rej) => {
    const bat = childProcess.spawn(fileName,params);
  
    bat.stdout.on('data', (data) => {
    console.log(data.toString());
    });
    
    bat.stderr.on('data', (data) => {
    console.log(data.toString());
    });
    
    bat.on('exit', (code) => {
    console.log('Exit')
    res("Resolved")
    });
    })
  
  }

