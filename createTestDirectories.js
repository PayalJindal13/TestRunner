const fs = require('fs');
const path = require('path')
const config_path = process.argv.slice(2)[0];
const working_directory = process.argv.slice(2)[1];
const writeIniFile = require('write-ini-file')
const buildData = require('./buildData')
const searchData = require('./searchData')
const generateFiles = () => {
if(!fs.existsSync(working_directory)){
    fs.promises.mkdir(working_directory).then(() => 
    fs.promises.readdir(config_path)).then(files => {
        files.forEach(file => {
            fs.promises.mkdir(path.join(working_directory,file)).then(() => {
                fs.promises.readFile(`${config_path}/${file}/TestConfig.json`,'utf-8').then((readData) => {
                    let dataFromTestConfig = JSON.parse(readData);
                    const dataType = dataFromTestConfig.datatype;
                    const dimension = dataFromTestConfig.dimension;
                    const dataSet = dataFromTestConfig.DataSet;
                    const query = dataFromTestConfig.Query;
                    dataFromTestConfig.Tests.forEach((test,index) => {
                        const dirname = `test_${index}`;
                        fs.promises.mkdir(path.join(working_directory,file,dirname)).then(() => {
                            fs.promises.readFile(dataSet,'utf-8').then((readData) => {
                                fs.writeFile(path.join(working_directory,file,dirname,'dataset.txt'),readData,err => err&&console.log("Error writing dataset",err))
                            })
                            fs.promises.readFile(query,'utf-8').then((readData) => {
                                fs.writeFile(path.join(working_directory,file,dirname,'query.txt'),readData,err => err&&console.log("Error writing query",err))
                               })
                            buildData.ANNIIndexTest.TestSuites = 'TestBuild'
                            buildData.TestBuild.Algorithm = 'randnsg'
                            buildData.TestBuild.DataType = dataType
                            buildData.TestBuild.Dimension = dimension
                            buildData.TestBuild.DistanceType = test.Build.distanceFn
                            buildData.TestBuild.InitStage = 'TestBuildInit'
                            buildData.TestBuild.RunStages = 'TestBuild'
                            buildData.TestBuild.EndStage = 'TestBuildEnd'
                            buildData.TestBuild_1.Operation = 'Build'
                            buildData.TestBuild_1.IndexBuildParameters = test.Build.BuildParams
                            buildData.TestBuild_1.ThreadCount = test.Build.BuildThreadCount
                            searchData.ANNIIndexTest.TestSuites = 'TestSearch'
                            searchData.TestSearch.Algorithm = 'randnsg'
                            searchData.TestSearch.DataType = dataType
                            searchData.TestSearch.Dimension = dimension
                            searchData.TestSearch.DistanceType = test.Build.distanceFn
                            searchData.TestSearch.InitStage = 'TestSeacrhInit'
                            searchData.TestSearch.RunStages = 'TestSearch'
                            searchData.TestSearch.EndStage = 'TestSearchEnd'
                            searchData.TestSearchInit.QueryParameters = test.Search.SearchParams
                            searchData.TestSearch_1.Operation = 'Search' 
                            searchData.TestSearch_1.ThreadCount = test.Build.BuildThreadCount
                            writeIniFile(path.join(working_directory,file,`${dirname}/build.ini`), buildData, err => err&&console.log("Error writing build.ini",err)) 
                            writeIniFile(path.join(working_directory,file,`${dirname}/search.ini`), searchData, err => err&&console.log("Error writing search.ini",err))
                        })
                    })
                }).then(() => console.log("Test Directories created successfully"))
            }) 
        })
    }).catch(err => console.log("Error: ",err))
}
else{
    console.log("Directory Already Exists!!")
    }
}
generateFiles()