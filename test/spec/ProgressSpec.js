describe('Progress', function () {
	'use strict';
	var progress, stub;

	beforeEach(function () {
		stub = jasmine.createSpy('stub');
	});

	afterEach(function () {
	});

	describe('Instantiation', function () {
		it('should have default weight in constructor', function() {
			progress = new Progress();
			expect(progress.get('weight')).toBe(1);
		});

		it('should have specified weight in constructor', function() {
			progress = new Progress({
				weight: 5
			});
			expect(progress.get('weight')).toBe(5);
		});
	});

	describe('Children', function () {
		it('create child Progress', function() {
			var childProgress;

			progress = new Progress();
			childProgress = progress.createChild();

			expect(progress.isChild(childProgress)).toBe(true);
		});

		it('create child Progress with a specified weight', function() {
			var childProgress;

			progress = new Progress();
			childProgress = progress.createChild(5);

			expect(childProgress.get('weight')).toBe(5);
		});

		it('add a Progress to be a child of another Progress', function() {
			var childProgress;

			progress = new Progress();
			childProgress = new Progress();

			progress.addChild(childProgress);

			expect(progress.isChild(childProgress)).toBe(true);
		});

		it('add multiple Progress instances to be a children of another Progress', function() {
			var progress1, progress2, progress3;

			progress = new Progress();
			progress1 = new Progress();
			progress2 = new Progress();
			progress3 = new Progress();

			progress.addChild(progress1);
			progress.addChild(progress2);
			progress.addChild(progress3);

			expect(progress.isChild(progress1)).toBe(true);
			expect(progress.isChild(progress2)).toBe(true);
			expect(progress.isChild(progress3)).toBe(true);
		});

		it('retrieve child progress by the Progress ID', function() {
			var progress1;

			progress = new Progress();
			progress1 = new Progress();

			progress.addChild(progress1);

			expect(progress.rerieveChild(progress1.id)).toBe(progress1);
		});

		it('has children', function() {
			var progress1;

			progress = new Progress();
			progress1 = new Progress();

			progress.addChild(progress1);

			expect(progress.hasChildren()).toBe(true);
		});

		it('has no children', function() {
			var progress1;

			progress = new Progress();
			progress1 = new Progress();

			expect(progress.hasChildren()).toBe(false);
		});

		it('has no children after child removed', function() {
			var progress1;

			progress = new Progress();
			progress1 = new Progress();

			progress.addChild(progress1);
			progress.removeChild(progress1);

			expect(progress.hasChildren()).toBe(false);
			expect(progress.isChild(progress1)).toBe(false);
		});
	});

	describe('Progress Update', function () {
		it('change in Progress amount should be correct', function() {

			progress = new Progress();
			progress.set({amountLoaded: 0.5});
			expect(progress.get('amountLoaded')).toBe(0.5);

			progress.set({amountLoaded: 0.55555});
			expect(progress.get('amountLoaded')).toBe(0.55555);

			progress.set({amountLoaded: -1});
			expect(progress.get('amountLoaded')).toBe(0);

			progress.set({amountLoaded: 2});
			expect(progress.get('amountLoaded')).toBe(1);
		});

		it('change in Progress should dispatch event', function() {
			var respond;

			runs(function () {
				progress = new Progress();

				respond = {};
				respond.responder = function () {
				};

				spyOn(respond, 'responder').andCallThrough();

				progress.on('change:amountLoaded', respond.responder);
				progress.set({
					amountLoaded: 1
				});
			});

			waits(0);

			runs(function () {
				expect(respond.responder).toHaveBeenCalled();
				expect(respond.responder.calls.length).toBe(1);
				progress.off('change:amountLoaded', respond.responder);
			});
		});

		it('change in parent Progress that has children should not change value or dispatch event in parent', function() {
			var progress1, progress2, respond;

			runs(function () {
				progress = new Progress();
				progress1 = new Progress();
				progress2 = new Progress();

				respond = {};
				respond.responder = function (amountLoaded) {
				};

				spyOn(respond, 'responder').andCallThrough();

				progress.on('change:amountLoaded', respond.responder);

				progress.addChild(progress1);
				progress.addChild(progress2);

				progress.set({
					amountLoaded: 0.5
				});
			});

			waits(0);

			runs(function () {
				expect(respond.responder).not.toHaveBeenCalled();
				expect(progress.get('amountLoaded')).toBe(0);
				progress.off('change:amountLoaded', respond.responder);
			});
		});

		it('change in child Progress should dispatch event in parent', function() {
			var progress1, respond;

			runs(function () {
				progress = new Progress();
				progress1 = new Progress();

				respond = {};
				respond.responder = function (amountLoaded) {
				};

				spyOn(respond, 'responder').andCallThrough();

				progress.on('change:amountLoaded', respond.responder);

				progress.addChild(progress1);

				progress1.set({
					amountLoaded: 0.5
				});
			});

			waits(0);

			runs(function () {
				expect(respond.responder).toHaveBeenCalled();
				expect(respond.responder.calls.length).toBe(1);
				expect(progress.get('amountLoaded')).toBe(0.5);
				progress.off('change:amountLoaded', respond.responder);
			});
		});

		it('change in multiple child Progress should dispatch single event in parent', function() {
			var progress1, progress2, respond;

			runs(function () {
				progress = new Progress();
				progress1 = new Progress();
				progress2 = new Progress();

				respond = {};
				respond.responder = function (amountLoaded) {
				};

				spyOn(respond, 'responder').andCallThrough();

				progress.on('change:amountLoaded', respond.responder);

				progress.addChild(progress1);
				progress.addChild(progress2);

				progress1.set({
					amountLoaded: 0.5
				});

				progress2.set({
					amountLoaded: 1
				});
			});

			waits(0);

			runs(function () {
				expect(respond.responder).toHaveBeenCalled();
				expect(respond.responder.calls.length).toBe(1);
				expect(progress.get('amountLoaded')).toBe(0.75);
				progress.off('change:amountLoaded', respond.responder);
			});
		});

		it('change in complex multiple child Progress should dispatch single event in parent', function() {
			var progress1, progress2, progress3, progress4, respond;

			runs(function () {
				progress = new Progress();
				progress1 = new Progress();
				progress2 = new Progress();
				progress3 = new Progress();
				progress4 = new Progress();

				respond = {};
				respond.responder = function (amountLoaded) {
				};

				spyOn(respond, 'responder').andCallThrough();

				progress.on('change:amountLoaded', respond.responder);

				progress2.addChild(progress3);
				progress2.addChild(progress4);

				progress.addChild(progress1);
				progress.addChild(progress2);

				progress1.set({
					amountLoaded: 0.5
				});

				progress3.set({
					amountLoaded: 1
				});

				progress4.set({
					amountLoaded: 0.5
				});
			});

			waits(0);

			runs(function () {
				expect(respond.responder).toHaveBeenCalled();
				expect(respond.responder.calls.length).toBe(1);
				expect(progress.get('amountLoaded')).toBe(0.625);
				progress.off('change:amountLoaded', respond.responder);
			});
		});

		it('change in complex multiple weighted child Progress should dispatch single event in parent', function() {
			var progress1, progress2, progress3, progress4, respond;

			runs(function () {
				progress = new Progress();
				progress1 = new Progress({
					weight: 2
				});
				progress2 = new Progress({
					weight: 8
				});
				progress3 = new Progress();
				progress4 = new Progress();

				respond = {};
				respond.responder = function (amountLoaded) {
				};

				spyOn(respond, 'responder').andCallThrough();

				progress.on('change:amountLoaded', respond.responder);

				progress2.addChild(progress3);
				progress2.addChild(progress4);

				progress.addChild(progress1);
				progress.addChild(progress2);

				progress3.set({
					amountLoaded: 1
				});

				progress4.set({
					amountLoaded: 1
				});
			});

			waits(10);

			runs(function () {
				expect(respond.responder).toHaveBeenCalled();
				expect(respond.responder.calls.length).toBe(1);
				expect(progress.get('amountLoaded')).toBe(0.8);
				progress.off('change:amountLoaded', respond.responder);
			});
		});
	});
});