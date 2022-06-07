# TestRunner
## Steps to run the TestRunner:
Make sure that TestRunner is at the same level of directory as the directory containing ANNIndexTools.exe
(e.g if ANNIndexTestTool.exe is at C:\\Work\\diskann then the path of TestRunner should be: C:\\Work\\TestRunner)
1. Run the command in the TestRunner npm install to install the dependencies as :
      **npm install**
2. Next, run the command to run testrunner with two parameters:
      - Config File path as first parameter
      - Working directory as second parameter
      
   Run it as: 
      **node createTestDirectories.js (path to config directory) (path to working directory)**

After that execution will start and end in some time and creates required files inside the working directory passed as parameter.
