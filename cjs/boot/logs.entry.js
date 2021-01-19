"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var browser_core_1 = require("@datadog/browser-core");
var logger_1 = require("../domain/logger");
var logs_1 = require("./logs");
exports.datadogLogs = makeLogsPublicApi(logs_1.startLogs);
browser_core_1.defineGlobal(browser_core_1.getGlobalObject(), 'DD_LOGS', exports.datadogLogs);
function makeLogsPublicApi(startLogsImpl) {
    var isAlreadyInitialized = false;
    var globalContextManager = browser_core_1.createContextManager();
    var customLoggers = {};
    var beforeInitSendLog = new browser_core_1.BoundedBuffer();
    var sendLogStrategy = function (message, currentContext) {
        beforeInitSendLog.add([message, currentContext]);
    };
    var logger = new logger_1.Logger(sendLog);
    return browser_core_1.makePublicApi({
        logger: logger,
        init: browser_core_1.monitor(function (userConfiguration) {
            if (!(userConfiguration.allowLocalFile || browser_core_1.checkIsNotLocalFile()) || !canInitLogs(userConfiguration)) {
                return;
            }
            if (userConfiguration.publicApiKey) {
                userConfiguration.clientToken = userConfiguration.publicApiKey;
                console.warn('Public API Key is deprecated. Please use Client Token instead.');
            }
            sendLogStrategy = startLogsImpl(userConfiguration, logger, globalContextManager.get);
            beforeInitSendLog.drain(function (_a) {
                var message = _a[0], context = _a[1];
                return sendLogStrategy(message, context);
            });
            isAlreadyInitialized = true;
        }),
        getLoggerGlobalContext: browser_core_1.monitor(globalContextManager.get),
        setLoggerGlobalContext: browser_core_1.monitor(globalContextManager.set),
        addLoggerGlobalContext: browser_core_1.monitor(globalContextManager.add),
        removeLoggerGlobalContext: browser_core_1.monitor(globalContextManager.remove),
        createLogger: browser_core_1.monitor(function (name, conf) {
            if (conf === void 0) { conf = {}; }
            customLoggers[name] = new logger_1.Logger(sendLog, conf.handler, conf.level, tslib_1.__assign(tslib_1.__assign({}, conf.context), { logger: { name: name } }));
            return customLoggers[name];
        }),
        getLogger: browser_core_1.monitor(function (name) {
            return customLoggers[name];
        }),
    });
    function canInitLogs(userConfiguration) {
        if (isAlreadyInitialized) {
            if (!userConfiguration.silentMultipleInit) {
                console.error('DD_LOGS is already initialized.');
            }
            return false;
        }
        if (!userConfiguration || (!userConfiguration.publicApiKey && !userConfiguration.clientToken)) {
            console.error('Client Token is not configured, we will not send any data.');
            return false;
        }
        if (userConfiguration.sampleRate !== undefined && !browser_core_1.isPercentage(userConfiguration.sampleRate)) {
            console.error('Sample Rate should be a number between 0 and 100');
            return false;
        }
        return true;
    }
    function sendLog(message) {
        sendLogStrategy(message, browser_core_1.combine({
            date: Date.now(),
            view: {
                referrer: document.referrer,
                url: window.location.href,
            },
        }, globalContextManager.get()));
    }
}
exports.makeLogsPublicApi = makeLogsPublicApi;
//# sourceMappingURL=logs.entry.js.map