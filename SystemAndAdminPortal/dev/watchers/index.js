'use strict';

global.watchFileChanges = (patterns, parent) => {
	let watchList = [];
	patterns.forEach((pattern) => {
		watchList.push(`${CONFIG.longInputDir}/${pattern}`);
	});

	// Ignore dotfiles
	let options = {
		ignored: /[\/\\]\./
	};

	return chokidar.watch(watchList, options).on('all', (event, inFile) => {

		// Determine shorthand inFile
		let shortInFile = inFile.replace(CONFIG.SERVER_PATH, '').slice(1);

		// Determine outFile, using parent modifier if detected
		let outFile = CONFIG.longOutputDir +
		              shortInFile.slice(3);
		if (parent.outFileModifier) outFile = parent.outFileModifier(outFile);

		// Make the directory in which to store the file
		fs.mkdir(path.dirname(outFile), (error) => {});

		// Call function based on event
		if (event === 'unlink') {
			console.log(`${parent.name}~ ${shortInFile} deleted`);
			fs.unlink(outFile);
		} else {
			try {
				parent.processFile(inFile, outFile);
				let eventName = (event === 'add' ? 'added' : 'changed');
				console.log(`${parent.name}~ ${shortInFile} ${eventName}`);
			} catch (error) {
				console.error(parent.name + '~ Error: ' + error.message);
			}
		}
	});
};

require('./less');
