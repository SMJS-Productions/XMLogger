import type { InspectOptions } from "util";
import type { LoggingType } from "./LoggingType";

export type LogHistory = {
    env: string;
    message: string;
    original: any;
    formatted: string;
} & ({
    type: Exclude<LoggingType, "dir" | "table">
} | {
    type: "dir",
    options: InspectOptions;
} | {
    type: "table",
    columns: string[];
});
