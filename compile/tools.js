var fs = require('fs');
var p = require('path');

function countDefinedValues(arr) {
	var count = 0;
	
	for (var i in arr) {
		if (arr[i] !== undefined) count++;
	}

	return count;
}

function asyncArray(arr, doSomething, onComplete) {
    var orderIds = 0;
	var finalArray = [];
	var arrCount = countDefinedValues(arr);
	
    function finished() {
        if (countDefinedValues(finalArray) === arrCount) {
			//console.log(thisId + ': completed');
            onComplete(finalArray);
        }
    }
    
    for (var i in arr) {
		(function () {
			var thisId = ++orderIds + 0;
			doSomething(arr[i], function (arrItem) {
				finalArray[thisId] = arrItem;
				finished();
			});
		}());
    }
}

function listFiles(path, ext, onComplete) {
	if (onComplete === undefined) {
		onComplete = ext;
		ext = undefined;
	}
	
	fs.readdir(path, function (err, files) {
		if (err) throw err;

		var finalFiles = [];
		var file;
		
		for (var f in files) {
			file = files[f];
			
			if (ext && p.extname(file) !== ext) {
				// Failed ext check
				continue;
			}
			
			finalFiles.push(path + '/' + file);
		}
		
		onComplete(finalFiles);
	});
}

function resolvePaths(pathArray, prefix, onComplete) {
	if (onComplete === undefined) {
		onComplete = prefix;
		prefix = '';
	}
	
    asyncArray(
        pathArray,
        function (path, handle) {
			var filename;
			var pathPrefixed;
			var starIndex = path.indexOf('*');
			
			if (starIndex > -1) {
				filename = path.substr(starIndex);
				pathPrefixed = prefix + path.substr(0, starIndex);
			} else {
				filename = p.basename(prefix + path);
				pathPrefixed = p.dirname(prefix + path);
			}
			
            fs.realpath(pathPrefixed, function (err, resolvedPath) {
				if (err) throw err;
                handle(resolvedPath + '/' + filename);
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

exports.asyncArray = asyncArray;
exports.resolvePaths = resolvePaths;
exports.concatFiles = concatFiles;
exports.listFiles = listFiles;