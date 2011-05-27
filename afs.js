var exec = require('child_process').exec;
var fs = require("fs");
var _ = require("./underscore")._;
var tools = require("./afs/tools");
var p = require('path');
var args = process.argv;
var options = {
	"manifest" : "manifest.json",
	"dist"     : "dist",
	"path"     : ".",
	"logging"  : false
};

while (args.length > 0) {
	var v = args.shift();
	
	switch (v) {
		case "-p":
		case "--path":
			options.path = args.shift();
			break;
		case "-m":
		case "--manifest":
			options.manifest = args.shift();
			break;
		case "-d":
		case "--dist":
			options.dist = args.shift();
			break;
		case "-l":
		case "--logging":
			options.logging = true;
			break;
	}
}

function findFilesForPaths(paths, onComplete) {
	tools.asyncArray(
		paths,
		function (path, handle) {
			var ext = p.extname(path);
			var base = p.basename(path, ext);
			
			if (base === '*') {
				tools.listFiles(p.dirname(path), ext, handle);
			} else {
				handle([path]);
			}
		},
		function (arrayOfArrays) {
			var finalArr = [];
			var files;
			
			for (var a in arrayOfArrays) {
				var files = arrayOfArrays[a];
				for (var f in files) {
					finalArr.push(files[f]);
				}
			}
			
			onComplete(finalArr);
		}
	);
}

function writeFile(file, data) {
	fs.writeFile(file, data, function (err) {
		if (err) throw err;
		console.log(file + " has been written.");
	});
}

function concatJs(toLocation, files) {
	var finalString = '';
	
	_.forEach(files, function (file) {
		finalString += fs.readFileSync(file, 'utf8');
	});

	writeFile(toLocation, finalString);
}

function copyFiles(toLocation, files) {
	_.forEach(files, function (file) {
		return;
		exec('cp -rf ' + file + ' ' + toLocation + '/' file, function (err, stdout, stderr) {
			if (err) throw err;
		});
	});
}

fs.readFile(options.path + "/" + options.manifest, 'utf8', function (err, manifest) {
	manifest = JSON.parse(manifest);

	_.forEach(manifest, function (paths, output) {
		var toLocation = p.resolve(__dirname, options.path + "/" + options.dist + "/" + output);
		
		tools.resolvePaths(paths, options.path + "/", function (resolvedPaths) {
		
			findFilesForPaths(resolvedPaths, function (files) {
				if (options.logging) {
					console.log(toLocation);
					console.log('    ' + files.join('\n    '));
					console.log('\n');
				}
				
				if (p.extname(toLocation) === '.js') {
					concatJs(toLocation, files);
				} else {
					copyFiles(toLocation, files);
				}
			});
		});
	});
});