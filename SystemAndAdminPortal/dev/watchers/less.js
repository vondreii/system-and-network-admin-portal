'use strict';

const _ = require('lodash');
const less = require('less');
const LessPluginAutoprefix = require('less-plugin-autoprefix');
const LessPluginCleanCSS = require('less-plugin-clean-css');

let autoprefixPlugin = new LessPluginAutoprefix({
	browsers: ["last 2 versions"]
});
let cleanCSSPlugin = new LessPluginCleanCSS({
	advanced: true
});

watchFileChanges(['**/*.less'], {
	name: 'Less',

	// Modify output file to be CSS
	outFileModifier: (outFile) => {
		return outFile.slice(0, -5) + '.css';
	},

	processFile: _.debounce(function (inFile, outFile) {
		fs.readFile('www/main.less', 'utf8', (err, data) => {
			less.render(data, {
				compress: true,
				filename: 'main.less',
				paths: ['www'],
				plugins: [
					autoprefixPlugin,
					cleanCSSPlugin
				]
			}, function (error, output) {
				fs.writeFile('www/main.css', output.css);
			});
		});
	}, 500)
});
