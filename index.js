var dir = require("node-dir");
var path = require("path");
var fs = require("fs");

module.exports = function(folder, cb) {

	var cwd = process.cwd();
	process.chdir(folder);

	// Wrap the original callback so we don't forget to change directory back
	var cbWrapper = function () {
		process.chdir(cwd);
		cb.apply(null, arguments);
	};

	dir.files(process.cwd(), function(err, files) {
		if (err) {
			cbWrapper(err);
		}
		else {
			var moduleNames = ["main"];
			var filesByModule = {
				main: []
			};
			for (var i = 0; i < files.length; i++) {
				var file = files[i];
				var fileParts = file.split(path.sep);
				var lastIdx = fileParts.lastIndexOf("node_modules");

				if (file.match(/\.js$/)) {
					if (lastIdx >= 0) {
						var moduleName = fileParts[lastIdx + 1];
						filesByModule[moduleName] = filesByModule[moduleName] || [];
						filesByModule[moduleName].push(files[i]);
						if (moduleNames.indexOf(moduleName) === -1) {
							moduleNames.push(moduleName);
						}
					}
					else {
						filesByModule["main"].push(files[i]); // eslint-disable-line dot-notation
					}
				}
			}

			var modulesByEnvVars = {};

			for (var i = 0; i < moduleNames.length; i++) {
				var moduleName = moduleNames[i];

				for (var j = 0; j < filesByModule[moduleName].length; j++) {
					var file = filesByModule[moduleName][j];
					var content = fs.readFileSync(file).toString();

					var envVars = content.match(/process\.env\.[a-zA-z_]*/);
					if (envVars) {
						envVars.forEach(function(pev) {
							var ev = pev.split(".")[2];
							modulesByEnvVars[ev] = modulesByEnvVars[ev] || [];
							if (modulesByEnvVars[ev].indexOf(moduleName) === -1) {
								modulesByEnvVars[ev].push(moduleName);
							}
						});
					}
				}
			}

			cbWrapper(null, modulesByEnvVars);
		}
	});
};
