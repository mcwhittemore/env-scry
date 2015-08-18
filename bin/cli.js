#! /usr/bin/env node

var envScry = require("../");

envScry(process.cwd(), function(err, modulesByEnvVars){
	if (err) throw err;
	var envVars = Object.keys(modulesByEnvVars);

	var envVarsByTitle = {};

	for(var i=0; i< envVars.length; i++){
		var ev = envVars[i];
		var title = "# from "+modulesByEnvVars[ev].join(", ");
		envVarsByTitle[title] = envVarsByTitle[title] || [];
		envVarsByTitle[title].push(ev+"=\"\"");
	}

	var titles = Object.keys(envVarsByTitle);

	for(var i=0; i<titles.length; i++){
		var title = titles[i];
		console.log(title);
		console.log(envVarsByTitle[title].join("\n"), "\n");
	}

});
