/*
	MODULE FOR COMPILATION OF PHP

	CLASS NAME: ExecPHP
	PROGRAMMER: Martin Mouritzen, YU CHI TO

	Purpose:
	parser ammended from https://medium.com/@MartinMouritzen/how-to-run-php-in-node-js-and-why-you-probably-shouldnt-do-that-fb12abe955b0
	Adaptations added for adding parameters and multiple file parsing in this project.
	Unused and deprecated
	Will be removed in future

	Environment:
	Microsoft Windows with PHP installed
*/
const {exec} = require('child_process');

class ExecPHP {
	constructor() {
		this.phpPath = 'D:/program/xampp/php/php.exe';
		this.phpFolder = './views';
	}

	// to parse php script
	parseFile(filename, params, callback) {
		var filePath = this.phpFolder + filename;

		console.log('parsing file: ' + filePath);
		var cmd = this.phpPath + ' ' + filePath;

		for(var i=0;i<params.length;i++)
		{
			cmd += ' '+params[i];
		}

		exec(cmd, function(error, stdout, stderr) {
			callback(error, stdout, stderr);
		});
	}
}
module.exports = function() {
	return new ExecPHP();
};
