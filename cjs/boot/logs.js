"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var browser_core_1 = require("@datadog/browser-core");
var loggerSession_1 = require("../domain/loggerSession");
var buildEnv_1 = require("./buildEnv");
var FIELDS_WITH_SENSITIVE_DATA = ['view.url', 'view.referrer', 'message', 'error.stack', 'http.url'];
function startLogs(userConfiguration, errorLogger, getGlobalContext) {
    var _a = browser_core_1.commonInit(userConfiguration, buildEnv_1.buildEnv), configuration = _a.configuration, internalMonitoring = _a.internalMonitoring;
    var errorObservable = userConfiguration.forwardErrorsToLogs !== false
        ? browser_core_1.startAutomaticErrorCollection(configuration)
        : new browser_core_1.Observable();
    var session = loggerSession_1.startLoggerSession(configuration, browser_core_1.areCookiesAuthorized(configuration.cookieOptions));
    return doStartLogs(configuration, errorObservable, internalMonitoring, session, errorLogger, getGlobalContext);
}
exports.startLogs = startLogs;
function doStartLogs(configuration, errorObservable, internalMonitoring, session, errorLogger, getGlobalContext) {
    internalMonitoring.setExternalContextProvider(function () {
        return browser_core_1.combine({ session_id: session.getId() }, getGlobalContext(), getRUMInternalContext());
    });
    var assemble = buildAssemble(session, configuration);
    var batch = startLoggerBatch(configuration);
    errorObservable.subscribe(function (error) {
        errorLogger.error(error.message, browser_core_1.combine({
            date: browser_core_1.getTimestamp(error.startTime),
            error: {
                kind: error.type,
                origin: error.source,
                stack: error.stack,
            },
        }, error.resource
            ? {
                http: {
                    method: error.resource.method,
                    status_code: error.resource.statusCode,
                    url: error.resource.url,
                },
            }
            : undefined, getRUMInternalContext(error.startTime)));
    });
    return function (message, currentContext) {
        var contextualizedMessage = assemble(message, currentContext);
        if (contextualizedMessage) {
            batch.add(contextualizedMessage);
        }
    };
}
exports.doStartLogs = doStartLogs;
function startLoggerBatch(configuration) {
    var primaryBatch = createLoggerBatch(configuration.logsEndpoint);
    var replicaBatch;
    if (configuration.replica !== undefined) {
        replicaBatch = createLoggerBatch(configuration.replica.logsEndpoint);
    }
    function createLoggerBatch(endpointUrl) {
        return new browser_core_1.Batch(new browser_core_1.HttpRequest(endpointUrl, configuration.batchBytesLimit), configuration.maxBatchSize, configuration.batchBytesLimit, configuration.maxMessageSize, configuration.flushTimeout);
    }
    return {
        add: function (message) {
            primaryBatch.add(message);
            if (replicaBatch) {
                replicaBatch.add(message);
            }
        },
    };
}
function buildAssemble(session, configuration) {
    return function (message, currentContext) {
        if (!session.isTracked()) {
            return undefined;
        }
        var contextualizedMessage = browser_core_1.combine({ service: configuration.service, session_id: session.getId() }, currentContext, getRUMInternalContext(), message);
        if (configuration.beforeSend) {
            browser_core_1.limitModification(contextualizedMessage, FIELDS_WITH_SENSITIVE_DATA, configuration.beforeSend);
        }
        return contextualizedMessage;
    };
}
exports.buildAssemble = buildAssemble;
function assembleMessageContexts(defaultContext, currentContext, rumInternalContext, message) {
    return browser_core_1.combine(defaultContext, currentContext, rumInternalContext, message);
}
exports.assembleMessageContexts = assembleMessageContexts;
function getRUMInternalContext(startTime) {
    var rum = window.DD_RUM;
    return rum && rum.getInternalContext ? rum.getInternalContext(startTime) : undefined;
}
//# sourceMappingURL=logs.js.map