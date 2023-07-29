import type { LoggingType } from "./LoggingType";

export interface LogHistory {
    env: string;
    type: LoggingType;
    message: string;
}
