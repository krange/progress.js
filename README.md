#progress.js

##Intro

Progress.js is a utility built on top of Backbone.js to help track load progress of multiple resources, classes, etc. Instances can be children of other instances, creating a tree effect. Updating a child progress will update the parent progress, allowing you to allocate progress tracking easily across your application.

Quick notes:

- Progress load amount is from 0 - 1.
- Progress instances can be assigned a weight to give a more accurate tracking measure. This is espeically useful if you are displaying a progress bar and are loading a 10mb file and a 10kb file.
- Progress instances are built upon the Backbone.js event system. Listen for changes with on/off on the 'amountLoaded' property.
- When multiple children are updating at the same time, progress instances will accumulate all updates and only dispatch a single event.

More documentation to come. Tests are through Jasmine in the test folder.

##Usage

###Create a new instance

		progress = new Progress();

###Create a child instance

		childProgress = new Progress();
		progress.addChild(childProgress);

Shorthand:

		childProgress = progress.createChild();

###Get amount loaded

		progress.get('amountLoaded');

###Set amount loaded

		// Value between 0 and 1
		progress.set({amountLoaded: 0.75});

###Listen for updates

		progress.on('change:amountLoaded', function (progress, amountLoaded) {
		});
		progress.set({amountLoaded: 0.75});

###Set child amount loaded

		childProgress = new Progress();
		progress.addChild(childProgress);
		childProgress.set({amountLoaded: 0.75});
		progress.get('amountLoaded'); // Output: 0.75

A more complex example

		cp = new Progress();
		cp1 = new Progress();
		cp2 = new Progress();
		cp3 = new Progress();

		cp1.addChild(cp2);
		cp1.addChild(cp3);

		progress.addChild(cp);
		progress.addChild(cp1);

		cp2.set({amountLoaded: 1});
		cp2.set({amountLoaded: 1});

		progress.get('amountLoaded'); // Output will be 0.5

###Remove child

		progress.removeChild(childProgress);

Remove child by ID

		progress.removeChildById(childProgress.id);

###Instantiate with a specified weight

		progress = new Progress({weight: 8});

###Create a child instance with a specified weight

		childProgress = new Progress({weight: 8});
		progress.addChild(childProgress);

Shorthand:

		childProgress = progress.createChild(8);

