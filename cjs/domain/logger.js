"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var browser_core_1 = require("@datadog/browser-core");
exports.StatusType = {
    debug: 'debug',
    error: 'error',
    info: 'info',
    warn: 'warn',
};
var STATUS_PRIORITIES = (_a = {},
    _a[exports.StatusType.debug] = 0,
    _a[exports.StatusType.info] = 1,
    _a[exports.StatusType.warn] = 2,
    _a[exports.StatusType.error] = 3,
    _a);
exports.STATUSES = Object.keys(exports.StatusType);
exports.HandlerType = {
    console: 'console',
    http: 'http',
    silent: 'silent',
};
var Logger = /** @class */ (function () {
    function Logger(sendLog, handlerType, level, loggerContext) {
        if (handlerType === void 0) { handlerType = exports.HandlerType.http; }
        if (level === void 0) { level = exports.StatusType.debug; }
        if (loggerContext === void 0) { loggerContext = {}; }
        this.sendLog = sendLog;
        this.handlerType = handlerType;
        this.level = level;
        this.contextManager = browser_core_1.createContextManager();
        this.contextManager.set(loggerContext);
    }
    Logger.prototype.log = function (message, messageContext, status) {
        if (status === void 0) { status = exports.StatusType.info; }
        if (STATUS_PRIORITIES[status] >= STATUS_PRIORITIES[this.level]) {
            switch (this.handlerType) {
                case exports.HandlerType.http:
                    this.sendLog(tslib_1.__assign({ message: message,
                        status: status }, browser_core_1.combine(this.contextManager.get(), messageContext)));
                    break;
                case exports.HandlerType.console:
                    console.log(status + ": " + message, browser_core_1.combine(this.contextManager.get(), messageContext));
                    break;
                case exports.HandlerType.silent:
                    break;
            }
        }
    };
    Logger.prototype.debug = function (message, messageContext) {
        this.log(message, messageContext, exports.StatusType.debug);
    };
    Logger.prototype.info = function (message, messageContext) {
        this.log(message, messageContext, exports.StatusType.info);
    };
    Logger.prototype.warn = function (message, messageContext) {
        this.log(message, messageContext, exports.StatusType.warn);
    };
    Logger.prototype.error = function (message, messageContext) {
        var errorOrigin = {
            error: {
                origin: browser_core_1.ErrorSource.LOGGER,
            },
        };
        this.log(message, browser_core_1.combine(errorOrigin, messageContext), exports.StatusType.error);
    };
    Logger.prototype.setContext = function (context) {
        this.contextManager.set(context);
    };
    Logger.prototype.addContext = function (key, value) {
        this.contextManager.add(key, value);
    };
    Logger.prototype.removeContext = function (key) {
        this.contextManager.remove(key);
    };
    Logger.prototype.setHandler = function (handler) {
        this.handlerType = handler;
    };
    Logger.prototype.setLevel = function (level) {
        this.level = level;
    };
    tslib_1.__decorate([
        browser_core_1.monitored
    ], Logger.prototype, "log", null);
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map