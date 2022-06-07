const fs = require('fs');
const path = require('path')
const config_path = process.argv.slice(2)[0];
const working_directory = process.argv.slice(2)[1];
const writeIniFile = require('write-ini-file')
const buildData = require('./buildData')
const searchData = require('./searchData')
const annIndexExecuter = require('./executeAnnIndexTestTool')
const generateTruthFile = require('./generateTruthFile.js')
const generateFiles = () => {
    if (!fs.existsSync(working_directory)) {
        fs.promises.mkdir(working_directory).then(() =>
            fs.promises.readdir(config_path)).then(files => {
                Promise.all(files.map(testfile => {
                    const file = testfile
                    return fs.promises.mkdir(path.join(working_directory, file)).then(() => {
                        return fs.promises.readFile(`${config_path}/${file}/TestConfig.json`, 'utf-8').then((readData) => {
                            let dataFromTestConfig = JSON.parse(readData);
                            const dataType = dataFromTestConfig.datatype;
                            const dimension = dataFromTestConfig.dimension;
                            const dataSet = dataFromTestConfig.DataSet;
                            const query = dataFromTestConfig.Query;
                            const dataSetReader = fs.createReadStream(dataSet)
                            const dataSetWriter = fs.createWriteStream(path.join(working_directory, file, 'dataset.bin'))
                            dataSetReader.on('data', chunk => {
                                dataSetWriter.write(chunk)
                            })
                            dataSetReader.on('end', () => {
                                dataSetReader.close()
                                dataSetWriter.close()
                                console.log(`Dataset for ${file} Copied`)
                            })
                            const QueryReader = fs.createReadStream(query)
                            const QueryWriter = fs.createWriteStream(path.join(working_directory, file, 'query.bin'))
                            QueryReader.on('data', chunk => {
                                QueryWriter.write(chunk)
                            })
                            QueryReader.on('end', () => {
                                QueryReader.close()
                                QueryWriter.close()
                                console.log(`Query Set for ${file} Copied`)
                            })
                            return Promise.all(dataFromTestConfig.Tests.map((test, index) => {
                                const dirname = `test_${index}`;
                                return fs.promises.mkdir(path.join(working_directory, file, dirname)).then(() => {
                                    fs.mkdirSync(path.join(working_directory, file, dirname, "index"))
                                    buildData.ANNIndexTest.TestSuites = 'TestBuild'
                                    buildData.TestBuild.Algorithm = 'randnsg'
                                    buildData.TestBuild.DataType = dataType
                                    buildData.TestBuild.DimensionSize = dimension
                                    buildData.TestBuild.DistanceType = test.Build.distanceFn
                                    buildData.TestBuild.InitStage = 'TestBuildInit'
                                    buildData.TestBuild.RunStages = 'TestBuild'
                                    buildData.TestBuild.EndStage = 'TestBuildEnd'
                                    buildData.TestBuildInit.QueryParameters = test.Search.SearchParams
                                    buildData.TestBuildInit.InitializeIndexFile = path.join(working_directory, file, `${dirname}/indexfilelist.txt`)
                                    buildData.TestBuild_1.Operation = 'Build'
                                    buildData.TestBuild_1.VectorDataFile = dataSet
                                    buildData.TestBuild_1.SaveIndexFile = path.join(working_directory, file, `${dirname}/temp.txt`)
                                    buildData.TestBuild_1.IndexBuildParameters = test.Build.BuildParams
                                    const bP = test.Build.BuildParams
                                    buildData.TestBuild_1.ThreadCount = test.Build.BuildThreadCount
                                    buildData.TestBuildEnd.SaveIndexFile = path.join(working_directory, file, dirname, 'tempindex.txt')
                                    buildData.TestBuildEnd.PerformanceReportFile = path.join(working_directory, file, `${dirname}_R${bP.slice(0, 2)}_L${bP.slice(3, 5)}_B${bP.slice(6, 7)}_M${bP.slice(8, 9)}_T${bP.slice(10)}.txt`)
                                    const params = [buildData.TestBuild.Algorithm, buildData.TestBuild.DistanceType, buildData.TestBuild.DataType, buildData.TestBuild.DimensionSize, dataSet, path.join(working_directory, file, dirname, 'index', `${dirname}_R${bP.slice(0, 2)}_L${bP.slice(3, 5)}_B${bP.slice(6, 7)}_M${bP.slice(8, 9)}_T${bP.slice(10)}`), bP]
                                    return annIndexExecuter(params).then(() => {
                                        return fs.promises.readdir(path.join(working_directory, file, dirname, 'index')).then((files) => {
                                            let Files = files.reduce((fileNames, indexfile) => {
                                                fileNames += path.join(working_directory, file, dirname, 'index', indexfile) + '\n'
                                                return fileNames
                                            }, '')
                                            return fs.promises.writeFile(path.join(working_directory, file, dirname, 'indexfilelist.txt'), Files).then(async () => {
                                                console.log("Filenames written successfully")
                                                await writeIniFile(path.join(working_directory, file, `${dirname}/build.ini`), buildData, err => err && console.log("Error writing build.ini", err))
                                                const truthFileParams = [dataSet, query, '5', path.join(working_directory, file, dirname, 'gt.txt'), 'l2', 'float', '5']
                                                return generateTruthFile(truthFileParams).then(() => {
                                                    searchData.ANNIndexTest.TestSuites = 'TestSearch'
                                                    searchData.TestSearch.Algorithm = 'randnsg'
                                                    searchData.TestSearch.DataType = dataType
                                                    searchData.TestSearch.DimensionSize = dimension
                                                    searchData.TestSearch.DistanceType = test.Build.distanceFn
                                                    searchData.TestSearch.InitStage = 'TestSearchInit'
                                                    searchData.TestSearch.RunStages = 'TestSearch'
                                                    searchData.TestSearch.EndStage = 'TestSearchEnd'
                                                    searchData.TestSearch.RunSubstages = 'TestSearch_1'
                                                    searchData.TestSearchInit.QueryParameters = test.Search.SearchParams
                                                    searchData.TestSearchInit.InitializeIndexfile = path.join(working_directory, file, `${dirname}/indexfilelist.txt`)
                                                    searchData.TestSearch_1.Operation = 'search'
                                                    searchData.TestSearch_1.VectorDataFile = dataSet
                                                    searchData.TestSearch_1.ThreadCount = test.Build.BuildThreadCount
                                                    searchData.TestSearch_1.TruthsetFile = path.join(working_directory, file, dirname)
                                                    searchData.TestSearchEnd.PerformanceReportFile = path.join(working_directory, file, dirname, 'report.txt')
                                                    return writeIniFile(path.join(working_directory, file, `${dirname}/search.ini`), searchData, err => err && console.log("Error writing search.ini", err))
                                                        .then(() => annIndexExecuter([path.join(working_directory, file, dirname, 'search.ini')])).then(() => Promise.resolve("Successful"))
                                                })
                                                    .catch(err => console.log("Error writing file names", err))
                                            })
                                        })
                                    })
                                })
                            }))
                        })
                    })
                })
                ).then(() => console.log("Execution complete"))

            }).catch(err => console.log("Error: ", err))
    }
    else {
        console.log("Directory Already Exists!!")
    }
}
generateFiles()