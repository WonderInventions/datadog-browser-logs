"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var browser_core_1 = require("@datadog/browser-core");
exports.LOGGER_SESSION_KEY = 'logs';
var LoggerTrackingType;
(function (LoggerTrackingType) {
    LoggerTrackingType["NOT_TRACKED"] = "0";
    LoggerTrackingType["TRACKED"] = "1";
})(LoggerTrackingType = exports.LoggerTrackingType || (exports.LoggerTrackingType = {}));
function startLoggerSession(configuration, areCookieAuthorized) {
    if (!areCookieAuthorized) {
        var isTracked_1 = computeTrackingType(configuration) === LoggerTrackingType.TRACKED;
        return {
            getId: function () { return undefined; },
            isTracked: function () { return isTracked_1; },
        };
    }
    var session = browser_core_1.startSessionManagement(configuration.cookieOptions, exports.LOGGER_SESSION_KEY, function (rawTrackingType) {
        return computeSessionState(configuration, rawTrackingType);
    });
    return {
        getId: session.getId,
        isTracked: function () { return session.getTrackingType() === LoggerTrackingType.TRACKED; },
    };
}
exports.startLoggerSession = startLoggerSession;
function computeTrackingType(configuration) {
    if (!browser_core_1.performDraw(configuration.sampleRate)) {
        return LoggerTrackingType.NOT_TRACKED;
    }
    return LoggerTrackingType.TRACKED;
}
function computeSessionState(configuration, rawSessionType) {
    var trackingType = hasValidLoggerSession(rawSessionType) ? rawSessionType : computeTrackingType(configuration);
    return {
        trackingType: trackingType,
        isTracked: trackingType === LoggerTrackingType.TRACKED,
    };
}
function hasValidLoggerSession(trackingType) {
    return trackingType === LoggerTrackingType.NOT_TRACKED || trackingType === LoggerTrackingType.TRACKED;
}
//# sourceMappingURL=loggerSession.js.map