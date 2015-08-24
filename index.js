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
						filesByModule.main.push(files[i]);
					}
				}
			}

			var modulesByEnvVars = moduleNames.reduce(function (map, moduleName) {
				var mapModuleToEnvVars = createModuleToEnvVarsMapper(map, moduleName);
				var files = filesByModule[moduleName];
				files.forEach(function (file) {
					mapEnvVarsFromFile(file, mapModuleToEnvVars);
				});
				return map;
			}, {});

			cbWrapper(null, modulesByEnvVars);
		}
	});
};

function createModuleToEnvVarsMapper (modulesByEnvVars, moduleName) {
	return function mapModuleToEnvVars (envVar) {
		modulesByEnvVars[envVar] = modulesByEnvVars[envVar] || [];
		if (modulesByEnvVars[envVar].indexOf(moduleName) === -1) {
			modulesByEnvVars[envVar].push(moduleName);
		}
	};
}

function mapEnvVarsFromFile (file, mapFn) {
	var content = fs.readFileSync(file).toString();
	var matches = content.match(/process\.env\.[a-zA-z_]*/);

	if (matches) {
		matches.forEach(function (match) {
			var envVar = match.split(".")[2];
			mapFn(envVar);
		});
	}
}
