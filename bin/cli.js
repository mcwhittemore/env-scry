#! /usr/bin/env node

var envScry = require("../");

envScry(process.cwd(), function(err, modulesByEnvVars) {
	if (err) {
		throw err;
	}
	var envVars = Object.keys(modulesByEnvVars);

	var envVarsByTitle = envVars.reduce(function (map, envVar) {
		var title = "# from " + modulesByEnvVars[envVar].join(", ");
		map[title] = map[title] || [];
		map[title].push(envVar + '=""'); // eslint-disable-line quotes
		return map;
	}, {});

	var titles = Object.keys(envVarsByTitle);
	var title;

	for (var i = 0; i < titles.length; i++) {
		title = titles[i];
		console.log(title);
		console.log(envVarsByTitle[title].join("\n"), "\n");
	}

});
