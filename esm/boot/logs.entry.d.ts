import { Context, UserConfiguration } from '@datadog/browser-core';
import { HandlerType, Logger, StatusType } from '../domain/logger';
import { LogsEvent } from '../logsEvent.types';
import { startLogs } from './logs';
export interface LogsUserConfiguration extends UserConfiguration {
    forwardErrorsToLogs?: boolean;
    beforeSend?: (event: LogsEvent) => void;
}
export interface LoggerConfiguration {
    level?: StatusType;
    handler?: HandlerType;
    context?: object;
}
export declare type LogsPublicApi = ReturnType<typeof makeLogsPublicApi>;
export declare const datadogLogs: {
    logger: Logger;
    init: (userConfiguration: LogsUserConfiguration) => void;
    getLoggerGlobalContext: () => Context;
    setLoggerGlobalContext: (newContext: object) => void;
    addLoggerGlobalContext: (key: string, value: any) => void;
    removeLoggerGlobalContext: (key: string) => void;
    createLogger: (name: string, conf?: LoggerConfiguration) => Logger;
    getLogger: (name: string) => Logger | undefined;
} & {
    onReady(callback: () => void): void;
};
export declare type StartLogs = typeof startLogs;
export declare function makeLogsPublicApi(startLogsImpl: StartLogs): {
    logger: Logger;
    init: (userConfiguration: LogsUserConfiguration) => void;
    getLoggerGlobalContext: () => Context;
    setLoggerGlobalContext: (newContext: object) => void;
    addLoggerGlobalContext: (key: string, value: any) => void;
    removeLoggerGlobalContext: (key: string) => void;
    createLogger: (name: string, conf?: LoggerConfiguration) => Logger;
    getLogger: (name: string) => Logger | undefined;
} & {
    onReady(callback: () => void): void;
};
