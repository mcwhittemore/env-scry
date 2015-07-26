var dir = require("node-dir");
var path = require("path");
var fs = require("fs");

module.exports = function(folder, cb){

	dir.files(folder, function(err, files) {
		if(err){
			cb(err);
		}
		else{
			var moduleNames = ["active"];
			var filesByModule = {
				active: []
			};
			for(var i=0; i<files.length; i++){
				var file = files[i].replace(folder, "");

				if(file.match(/\.js$/)){
					var bits = file.split(path.sep);
					if(bits[1] == "node_modules"){
						filesByModule[bits[2]] = filesByModule[bits[2]] || [];
						filesByModule[bits[2]].push(files[i]);
					}
					else{
						filesByModule["active"].push(files[i]);
					}
				}

				if(file.match(/^\/node_modules\/[a-z\-\_]*\/package\.json$/)){
					var moduleName = file.split(path.sep)[2];
					moduleNames.push(moduleName);
				}
			}

			var modulesByEnvVars = {};

			for(var i=0; i<moduleNames.length; i++){
				var moduleName = moduleNames[i];

				for(var j=0; j<filesByModule[moduleName].length; j++){
					var file = filesByModule[moduleName][j];
					var content = fs.readFileSync(file).toString();
					
					var envVars = content.match(/process\.env\.[a-zA-z_]*/);
					if(envVars){
						envVars.forEach(function(pev){
							var ev = pev.split(".")[2];
							modulesByEnvVars[ev] = modulesByEnvVars[ev] || [];
							if(modulesByEnvVars[ev].indexOf(moduleName) === -1){
								modulesByEnvVars[ev].push(moduleName);
							}
						});
					}
				}
			}

			cb(null, modulesByEnvVars);
		}
	});
}
