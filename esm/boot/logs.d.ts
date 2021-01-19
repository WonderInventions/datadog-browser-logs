import { Configuration, Context, ErrorObservable, InternalMonitoring } from '@datadog/browser-core';
import { Logger, LogsMessage } from '../domain/logger';
import { LoggerSession } from '../domain/loggerSession';
import { LogsUserConfiguration } from './logs.entry';
export declare function startLogs(userConfiguration: LogsUserConfiguration, errorLogger: Logger, getGlobalContext: () => Context): (message: LogsMessage, currentContext: Context) => void;
export declare function doStartLogs(configuration: Configuration, errorObservable: ErrorObservable, internalMonitoring: InternalMonitoring, session: LoggerSession, errorLogger: Logger, getGlobalContext: () => Context): (message: LogsMessage, currentContext: Context) => void;
export declare function buildAssemble(session: LoggerSession, configuration: Configuration): (message: LogsMessage, currentContext: Context) => Context | undefined;
export declare function assembleMessageContexts(defaultContext: {
    service?: string;
    session_id?: string;
}, currentContext: Context, rumInternalContext: Context | undefined, message: LogsMessage): {
    service?: string | undefined;
    session_id?: string | undefined;
} & Context & LogsMessage;
