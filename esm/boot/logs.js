import { areCookiesAuthorized, Batch, combine, commonInit, getTimestamp, HttpRequest, limitModification, Observable, startAutomaticErrorCollection, } from '@datadog/browser-core';
import { startLoggerSession } from '../domain/loggerSession';
import { buildEnv } from './buildEnv';
var FIELDS_WITH_SENSITIVE_DATA = ['view.url', 'view.referrer', 'message', 'error.stack', 'http.url'];
export function startLogs(userConfiguration, errorLogger, getGlobalContext) {
    var _a = commonInit(userConfiguration, buildEnv), configuration = _a.configuration, internalMonitoring = _a.internalMonitoring;
    var errorObservable = userConfiguration.forwardErrorsToLogs !== false
        ? startAutomaticErrorCollection(configuration)
        : new Observable();
    var session = startLoggerSession(configuration, areCookiesAuthorized(configuration.cookieOptions));
    return doStartLogs(configuration, errorObservable, internalMonitoring, session, errorLogger, getGlobalContext);
}
export function doStartLogs(configuration, errorObservable, internalMonitoring, session, errorLogger, getGlobalContext) {
    internalMonitoring.setExternalContextProvider(function () {
        return combine({ session_id: session.getId() }, getGlobalContext(), getRUMInternalContext());
    });
    var assemble = buildAssemble(session, configuration);
    var batch = startLoggerBatch(configuration);
    errorObservable.subscribe(function (error) {
        errorLogger.error(error.message, combine({
            date: getTimestamp(error.startTime),
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
function startLoggerBatch(configuration) {
    var primaryBatch = createLoggerBatch(configuration.logsEndpoint);
    var replicaBatch;
    if (configuration.replica !== undefined) {
        replicaBatch = createLoggerBatch(configuration.replica.logsEndpoint);
    }
    function createLoggerBatch(endpointUrl) {
        return new Batch(new HttpRequest(endpointUrl, configuration.batchBytesLimit), configuration.maxBatchSize, configuration.batchBytesLimit, configuration.maxMessageSize, configuration.flushTimeout);
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
export function buildAssemble(session, configuration) {
    return function (message, currentContext) {
        if (!session.isTracked()) {
            return undefined;
        }
        var contextualizedMessage = combine({ service: configuration.service, session_id: session.getId() }, currentContext, getRUMInternalContext(), message);
        if (configuration.beforeSend) {
            limitModification(contextualizedMessage, FIELDS_WITH_SENSITIVE_DATA, configuration.beforeSend);
        }
        return contextualizedMessage;
    };
}
export function assembleMessageContexts(defaultContext, currentContext, rumInternalContext, message) {
    return combine(defaultContext, currentContext, rumInternalContext, message);
}
function getRUMInternalContext(startTime) {
    var rum = window.DD_RUM;
    return rum && rum.getInternalContext ? rum.getInternalContext(startTime) : undefined;
}
//# sourceMappingURL=logs.js.map