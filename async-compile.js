var fs = require('fs');

function asyncArray(arr, doSomething, onComplete) {
    var finalArray = [];
    
    function finished() {
        if (finalArray.length === arr.length) {
            onComplete(finalArray);
        }
    }
    
    for (i in arr) {
        doSomething(arr[i], function (arrItem) {
            finalArray.push(arrItem);
            finished();
        });
    }
}

function resolvePaths(pathArray, onComplete) {
    asyncArray(
        pathArray,
        function (path, handle) {
            fs.realpath(path, function (err, resolvedPath) {
                handle(resolvedPath);
            });
        },
        onComplete
    );
}

function concatFiles(fileArray, onComplete) {
    asyncArray(
        fileArray,
        function (file, handle) {
            fs.readFile(path, 'utf8', function (err, fileContents) {
                handle(fileContents);
            });
        },
        function (contentsArray) {
            onComplete(contentsArray.join("\n"));
        }
    );
}