'use strict';
var Events = require('events'),
    Hoek = require('hoek'),
    clan = require('clan'),
    defaults = {},
    goodMagicMixin = clan.mixin({
        _delegate: function (type, data) {
            this._emitter.emit('report', type, data);
        },
        start: function (emitter, callback) {
            this._status = 'active';
            this._proxy = emitter;
            if (this._currentReporter) {
                this._proxy.on('report', this._delegate);
                this._currentReporter.start.call(this._currentReporter, this._emitter, callback);
            } else {
                callback();
            }
        },
        stop: function () {
            this._status = 'off';
            if (this._currentReporter) {
                this._currentReporter.stop.apply(this._currentReporter, arguments);
            }
            this._emitter.removeAllListeners();
            this._proxy.removeListener('report', this._delegate);
        }
    });


module.exports = function goodMagic () {
    var emitter = new Events.EventEmitter(),
        self;

    return {
        Reporter: function GoodMagicReporter (options) {
            var settings, Constructor;
            self = this;

            Hoek.assert(this instanceof GoodMagicReporter, 'GoodMagicReporter must be created with new');

            options = options || {};
            settings = Hoek.applyToDefaults(defaults, options);

            goodMagicMixin(this);
            this._proxy = null;
            this._status = 'off';
            this._emitter = emitter;
            this._delegate = this._delegate.bind(this);

            if (options.reporter) {
                options.args = options.args || [];
                options.args.unshift(null);
                Constructor = options.reporter.bind.apply(options.reporter, options.args);
                this._currentReporter = new Constructor();
            } else {
                this._currentReporter = null;
            }
            return this;
        },
        update: function goodMagicUpdate (reporter, args, cb) {
            var Constructor, status  = self._status;
            if (status === 'active') {
                self.stop();
            }
            if (reporter) {
                args = args || [];
                args.unshift(null);
                Constructor = reporter.bind.apply(reporter, args);
                self._currentReporter = new Constructor();
            } else {
                self._currentReporter = null;
            }
            if (status === 'active') {
                self.start(self._proxy, cb);
            } else {
                cb();
            }
        }
    };
};

