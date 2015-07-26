var dir = require("node-dir");
var path = require("path");
var fs = require("fs");

dir.files(__dirname, function(err, files) {
	if(err){
		throw err;
	}
	else{
		var modules = ["active"];
		var filesByModule = {
			active: []
		};
		for(var i=0; i<files.length; i++){
			var file = files[i].replace(__dirname, "");

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
				var module = file.split(path.sep)[2];
				modules.push(module);
			}
		}

		var modulesByEnvVars = {};

		for(var i=0; i<modules.length; i++){
			var module = modules[i];

			for(var j=0; j<filesByModule[module].length; j++){
				var file = filesByModule[module][j];
				var content = fs.readFileSync(file).toString();
				
				var envVars = content.match(/process\.env\.[a-zA-z_]*/);
				if(envVars){
					envVars.forEach(function(pev){
						var ev = pev.split(".")[2];
						modulesByEnvVars[ev] = modulesByEnvVars[ev] || [];
						if(modulesByEnvVars[ev].indexOf(module) === -1){
							modulesByEnvVars[ev].push(module);
						}
					});
				}
			}
		}

		var envVars = Object.keys(modulesByEnvVars);

		var out = "";

		for(var i=0; i< envVars.length; i++){
			var ev = envVars[i];
			out+= "# from "+modulesByEnvVars[ev].join(", ")+"\n";
			out+= ev+"=\"\"\n\n";
		}

		console.log(out);
	}
});