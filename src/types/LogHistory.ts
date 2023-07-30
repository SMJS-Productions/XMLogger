import type { InspectOptions } from "util";
import type { LoggingType } from "./LoggingType";

export type LogHistory = {
    env: string;
    message: string;
} & ({
    type: Exclude<LoggingType, "dir" | "table">
} | {
    type: "dir",
    object: any;
    options: InspectOptions;
} | {
    type: "table",
    object: any;
    columns: string[];
});
