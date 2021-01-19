import { __assign } from "tslib";
import { BoundedBuffer, checkIsNotLocalFile, combine, createContextManager, defineGlobal, getGlobalObject, isPercentage, makePublicApi, monitor, } from '@datadog/browser-core';
import { Logger } from '../domain/logger';
import { startLogs } from './logs';
export var datadogLogs = makeLogsPublicApi(startLogs);
defineGlobal(getGlobalObject(), 'DD_LOGS', datadogLogs);
export function makeLogsPublicApi(startLogsImpl) {
    var isAlreadyInitialized = false;
    var globalContextManager = createContextManager();
    var customLoggers = {};
    var beforeInitSendLog = new BoundedBuffer();
    var sendLogStrategy = function (message, currentContext) {
        beforeInitSendLog.add([message, currentContext]);
    };
    var logger = new Logger(sendLog);
    return makePublicApi({
        logger: logger,
        init: monitor(function (userConfiguration) {
            if (!(userConfiguration.allowLocalFile || checkIsNotLocalFile()) || !canInitLogs(userConfiguration)) {
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
        getLoggerGlobalContext: monitor(globalContextManager.get),
        setLoggerGlobalContext: monitor(globalContextManager.set),
        addLoggerGlobalContext: monitor(globalContextManager.add),
        removeLoggerGlobalContext: monitor(globalContextManager.remove),
        createLogger: monitor(function (name, conf) {
            if (conf === void 0) { conf = {}; }
            customLoggers[name] = new Logger(sendLog, conf.handler, conf.level, __assign(__assign({}, conf.context), { logger: { name: name } }));
            return customLoggers[name];
        }),
        getLogger: monitor(function (name) {
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
        if (userConfiguration.sampleRate !== undefined && !isPercentage(userConfiguration.sampleRate)) {
            console.error('Sample Rate should be a number between 0 and 100');
            return false;
        }
        return true;
    }
    function sendLog(message) {
        sendLogStrategy(message, combine({
            date: Date.now(),
            view: {
                referrer: document.referrer,
                url: window.location.href,
            },
        }, globalContextManager.get()));
    }
}
//# sourceMappingURL=logs.entry.js.map