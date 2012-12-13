/*!
 * Progress.js 0.1.0
 * May be freely distributed under the MIT license
 * https://github.com/krange/progress.js
 */
(function (global) {
	'use strict';
	var Progress = Backbone.Model.extend({

		defaults: {
			weight: 1,
			totalChildWeight: 0,
			amountLoaded: 0
		},

		//--------------------------------------
		//  Private properties
		//--------------------------------------

		_children: undefined,
		_progressInvalidated: false,

		//---------------------------------------------------------------------
		//
		//  Public methods
		//
		//---------------------------------------------------------------------

		createChild: function (weight) {
			var progress;

			if (weight && !_.isNumber(weight)) {
				return;
			}

			progress = new Progress({
				weight: weight
			});
			this.addChild(progress);
			return progress;
		},

		addChild: function (progress) {
			var totalChildWeight;

			if (progress instanceof Progress) {
				progress.on('change:amountLoaded', this._onProgressUpdate, this);
				this._children.push(progress);
				totalChildWeight = this.get('totalChildWeight');
				this.set({
					totalChildWeight: totalChildWeight + progress.get('weight')
				});
			}
		},

		rerieveChild: function (id) {
			return _.find(this._children, function (progress) {
				if (id === progress.id) {
					return true;
				}
			});
		},

		isChild: function (progress) {
			var found;
			found = _.find(this._children, function (curProgress) {
				if (progress === curProgress) {
					return true;
				}
			});

			if (found) {
				return true;
			}

			return false;
		},

		hasChildren: function () {
			return (this._children.length > 0) ? true : false;
		},

		removeChild: function (progress) {
			return this.removeChildById(progress.id);
		},

		removeChildById: function (id) {
			var found, savedIndex;
			found = _.find(this._children, function (progress, index) {
				if (progress.id === id) {
					savedIndex = index;
					return true;
				}
			});

			if (found) {
				found.off('change:amountLoaded', this._onProgressUpdate, this);
				this._children.splice(savedIndex, 1);
				return true;
			}

			return false;
		},

		//--------------------------------------
		//  Override
		//--------------------------------------

		initialize: function (attributes, options) {
			this._children = [];
		},

		set: function (attributes, options) {
			var validated;

			if (attributes) {
				if (attributes.amountLoaded) {
					validated = this._validateAmountLoaded(attributes.amountLoaded);
					if (validated !== undefined) {
						attributes.amountLoaded = validated;
					} else {
						delete attributes.amountLoaded;
					}
				}

				if (attributes.weight) {
					validated = this._validateWeight(attributes.weight);
					if (validated !== undefined) {
						attributes.weight = validated;
					} else {
						delete attributes.weight;
					}
				}
			}

			Backbone.Model.prototype.set.call(this, attributes, options);
		},

		get: function (attribute) {
			if (attribute === 'amountLoaded') {
				if (this._children.length > 0) {
					return this._getChildrenLoaded();
				}
			}

			return Backbone.Model.prototype.get.call(this, attribute);
		},

		//---------------------------------------------------------------------
		//
		//  Private methods
		//
		//---------------------------------------------------------------------

		_getChildrenLoaded: function () {
			var totalAmountLoaded = 0;
			_.each(this._children, _.bind(function (progress) {
				totalAmountLoaded += progress.get('amountLoaded') * (progress.get('weight') / this.get('totalChildWeight'));
			}, this));
			return +totalAmountLoaded.toFixed(3);
		},

		_validateAmountLoaded: function (amountLoaded) {
			if (this._children.length === 0) {
				amountLoaded = (amountLoaded < 0) ? 0 : amountLoaded;
				amountLoaded = (amountLoaded > 1) ? 1 : amountLoaded;
				return amountLoaded;
			}
		},

		_validateWeight: function (weight) {
			if (weight > 0) {
				return weight;
			}
		},

		//--------------------------------------
		//  Handlers
		//--------------------------------------

		_onProgressUpdate: function () {
			if (!this._progressInvalidated) {
				this._progressInvalidated = true;
				setTimeout(_.bind(function () {
					this._progressInvalidated = false;
					this.trigger('change:amountLoaded', this.get('amountLoaded'));
				}, this), 0);
			}
		}
	});

	global.Progress = Progress;
}(window));