var _a;
import { __assign, __decorate } from "tslib";
import { combine, createContextManager, ErrorSource, monitored } from '@datadog/browser-core';
export var StatusType = {
    debug: 'debug',
    error: 'error',
    info: 'info',
    warn: 'warn',
};
var STATUS_PRIORITIES = (_a = {},
    _a[StatusType.debug] = 0,
    _a[StatusType.info] = 1,
    _a[StatusType.warn] = 2,
    _a[StatusType.error] = 3,
    _a);
export var STATUSES = Object.keys(StatusType);
export var HandlerType = {
    console: 'console',
    http: 'http',
    silent: 'silent',
};
var Logger = /** @class */ (function () {
    function Logger(sendLog, handlerType, level, loggerContext) {
        if (handlerType === void 0) { handlerType = HandlerType.http; }
        if (level === void 0) { level = StatusType.debug; }
        if (loggerContext === void 0) { loggerContext = {}; }
        this.sendLog = sendLog;
        this.handlerType = handlerType;
        this.level = level;
        this.contextManager = createContextManager();
        this.contextManager.set(loggerContext);
    }
    Logger.prototype.log = function (message, messageContext, status) {
        if (status === void 0) { status = StatusType.info; }
        if (STATUS_PRIORITIES[status] >= STATUS_PRIORITIES[this.level]) {
            switch (this.handlerType) {
                case HandlerType.http:
                    this.sendLog(__assign({ message: message,
                        status: status }, combine(this.contextManager.get(), messageContext)));
                    break;
                case HandlerType.console:
                    console.log(status + ": " + message, combine(this.contextManager.get(), messageContext));
                    break;
                case HandlerType.silent:
                    break;
            }
        }
    };
    Logger.prototype.debug = function (message, messageContext) {
        this.log(message, messageContext, StatusType.debug);
    };
    Logger.prototype.info = function (message, messageContext) {
        this.log(message, messageContext, StatusType.info);
    };
    Logger.prototype.warn = function (message, messageContext) {
        this.log(message, messageContext, StatusType.warn);
    };
    Logger.prototype.error = function (message, messageContext) {
        var errorOrigin = {
            error: {
                origin: ErrorSource.LOGGER,
            },
        };
        this.log(message, combine(errorOrigin, messageContext), StatusType.error);
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
    __decorate([
        monitored
    ], Logger.prototype, "log", null);
    return Logger;
}());
export { Logger };
//# sourceMappingURL=logger.js.map