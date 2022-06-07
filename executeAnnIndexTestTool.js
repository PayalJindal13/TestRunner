const fileName = 'C:\\Work\\diskann\\ANNIndexTestTool.exe'
const childProcess = require('child_process')

module.exports = annIndexExecuter = (params) => {
  return new Promise((res, rej) => {
    const bat = childProcess.spawn(fileName,params);
  
    bat.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    bat.stderr.on('data', (data) => {
      console.log(data.toString());
    });
    
    bat.on('exit', (code) => {
    console.log('Exit', code)
    res("Resolved")
    });
    })
  
  }

