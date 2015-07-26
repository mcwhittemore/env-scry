# env-scry

A simple tool for finding all the environment vars in both the active project and all of its dependencies.

## Usage

```js
var envScry = require("env-scry");

envScry(process.cwd(), function(err, data){
	var envVars = Object.keys(data);
	envVars.forEach(function(envVar){
		var sourceModules = data[envVar];
		console.log(envVar, sourceModules.join(" "));
	});
});
```

## CLI

`> npm install env-scry -g`

`> env-scry`

```shell
# from mocha
COV=""
MOCHA_COLORS=""
TERM=""
PATH=""
DEBUG_COLORS=""
JADE_COV=""
TEST_REGEN=""
NODE_DEBUG=""

```

