import { Context, ContextValue } from '@datadog/browser-core';
export declare const StatusType: {
    readonly debug: "debug";
    readonly error: "error";
    readonly info: "info";
    readonly warn: "warn";
};
export declare type StatusType = typeof StatusType[keyof typeof StatusType];
export declare const STATUSES: string[];
export interface LogsMessage {
    message: string;
    status: StatusType;
    [key: string]: ContextValue;
}
export declare const HandlerType: {
    readonly console: "console";
    readonly http: "http";
    readonly silent: "silent";
};
export declare type HandlerType = typeof HandlerType[keyof typeof HandlerType];
export declare class Logger {
    private sendLog;
    private handlerType;
    private level;
    private contextManager;
    constructor(sendLog: (message: LogsMessage) => void, handlerType?: HandlerType, level?: StatusType, loggerContext?: Context);
    log(message: string, messageContext?: object, status?: StatusType): void;
    debug(message: string, messageContext?: object): void;
    info(message: string, messageContext?: object): void;
    warn(message: string, messageContext?: object): void;
    error(message: string, messageContext?: object): void;
    setContext(context: object): void;
    addContext(key: string, value: any): void;
    removeContext(key: string): void;
    setHandler(handler: HandlerType): void;
    setLevel(level: StatusType): void;
}
