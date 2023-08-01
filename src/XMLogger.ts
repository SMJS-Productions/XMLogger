import type { InspectOptions } from "util";
import type { EscapeCodeTags } from "./types/EscapeCodeTags";
import type { LoggingType } from "./types/LoggingType";
import type { LogHistory } from "./types/LogHistory";
import { formatWithOptions } from "util";
import { ESCAPE_CODE_LIST } from "./statics/EscapeCodeList";
import { Settings } from "./Settings";

export class XMLogger {

    public static readonly SETTINGS = new Settings();

    private static readonly LISTENERS = new Map<LoggingType | "output" | string, Array<(env: string, ...args: any[]) => any>>();

    private static readonly TIMERS = new Map<string, number>();

    private static readonly CAPTURES = new Array<LogHistory>();

    private static readonly TYPE_PADDING = Math.max(...XMLogger.SETTINGS.getTypes().map((key) => key.split(/[A-Z]/)[0].length));

    public static on(type: "dir", callback: (env: string, message: string, object: any, options: InspectOptions) => any): void;

    public static on(type: "table", callback: (env: string, message: string, object: any, columns: string[]) => any): void;

    public static on(type: Exclude<LoggingType, "dir" | "table">, callback: (env: string, message: string) => any): void;

    public static on(type: "output" | string, callback: (env: string, message?: string, object?: any, optionsOrColumns?: InspectOptions | string[]) => any): void;

    public static on(type: LoggingType | "output" | string, callback: (env: string, ...args: any[]) => any): void {
        if (XMLogger.LISTENERS.has(type)) {
            XMLogger.LISTENERS.get(type)!.push(callback);
        } else {
            XMLogger.LISTENERS.set(type, [ callback ]);
        }
    }

    public static getOutput(): LogHistory[] {
        return XMLogger.CAPTURES;
    }

    public static log<T, U>(env: string, message: T, ...params: U[]): void {
        const instance = new XMLogger("log", env, message, ...params);

        console.log(instance.toString());
        instance.postLog();
    }

    public static info<T, U>(env: string, message: T, ...params: U[]): void {
        const instance = new XMLogger("info", env, message, ...params);

        console.info(instance.toString());
        instance.postLog();
    }

    public static warn<T, U>(env: string, message: T, ...params: U[]): void {
        const instance = new XMLogger("warn", env, message, ...params);

        console.warn(instance.toString());
        instance.postLog();
    }

    public static debug<T, U>(env: string, message: T, ...params: U[]): void {
        const instance = new XMLogger("debug", env, message, ...params);

        console.debug(instance.toString());
        instance.postLog();
    }

    public static error<T, U>(env: string, message: T, ...params: U[]): void {
        const instance = new XMLogger("error", env, message, ...params);

        console.error(instance.toString());
        instance.postLog();
    }

    public static trace<T, U>(env: string, message: T, ...params: U[]): void {
        const instance = new XMLogger("trace", env, message, ...params, "\n", new Error().stack?.split("\n")
            .slice(2)
            .join("\n")
            .slice(1) || "Missing stack");

        console.error(instance.toString());
        instance.postLog();
    }

    public static traceInfo<T, U>(env: string, message: T, ...params: U[]): void {
        const instance = new XMLogger("traceInfo", env, message, ...params, "\n", new Error().stack?.split("\n")
            .slice(2)
            .join("\n")
            .slice(1) || "Missing stack");

        console.info(instance.toString());
        instance.postLog();
    }

    public static dir<T>(env: string, message: T, options: InspectOptions = {}): void {
        const instance = new XMLogger("dir", env, message, {
            colors: true,
            depth: Infinity,
            ...options
        });

        console.info(instance.toString());
        instance.postLog();
    }

    public static table(env: string, tabularData: any[] | Record<any, any>, columns?: string[]): void {
        const instance = new XMLogger("table", env, tabularData, columns);

        console.info(instance.toString());
        // IDC that this doesn't log everything in the events, someone else can try telling an event what these edge case filled tables look like
        console.table(tabularData, columns);
        instance.postLog();
    }

    public static time(env: string, label?: string): void {
        const instance = new XMLogger("time", env, "Timer %s started", label || "unknown");

        XMLogger.TIMERS.set(label ?? "", Date.now());
        console.info(instance.toString());
        instance.postLog();
    }

    public static timeEnd(env: string, label?: string): void {
        const trueLabel = label ?? "";
        let instance;

        if (XMLogger.TIMERS.has(trueLabel)) {
            instance = new XMLogger("timeEnd", env, "Timer %s ended after %ss", label || "unknown", (
                Date.now() - XMLogger.TIMERS.get(trueLabel)!
            ) / 1000);

            XMLogger.TIMERS.delete(trueLabel);
            console.info(instance.toString());
        } else {
            instance = new XMLogger("time", env, "Timer %s doesn't exist", label || "unknown");
        }

        instance.postLog();
    }

    public static assert(env: string, assertion: any): void {
        let instance;

        if (assertion) {
            instance = new XMLogger("assertSuccess", env, "Successful assertion");

            console.info(instance.toString());
        } else {
            instance = new XMLogger("assertFailure", env, "Assertion failed");

            console.trace(instance.toString());
        }

        instance.postLog();
    }

    public static clear(env: string, confirmation = true): void {
        XMLogger.CAPTURES.splice(0, XMLogger.CAPTURES.length);
        console.clear();

        if (confirmation) {
            const instance = new XMLogger("clear", env, "The console was cleared");

            console.info(instance.toString());
            instance.postLog();
        }
    }

    private readonly env: string;

    private readonly type: LoggingType;

    private readonly message: string;

    private readonly originalMessage: any;

    private readonly formattedMessage: string;

    private readonly params: any[];

    private constructor(type: LoggingType, env: string, message: any, ...params: any[]) {
        if (XMLogger.SETTINGS.hasEnv(env)) {
            const emptyString = () => "";
            const minTypeName = type.split(/[A-Z]/)[0].toUpperCase();
            const date = new Date();
            const correctedDate = new Date(date.setMinutes(date.getMinutes() + date.getTimezoneOffset()));
            const templateTagPopulators = new Map([
                [ "type", () => minTypeName ],
                [ "type-tags", () => this.formatTags(XMLogger.SETTINGS.getTypeTags(type)) ],
                [ "env", () => env ],
                [ "env-tags", () => this.formatTags(XMLogger.SETTINGS.getEnvTags(env)!) ],
                [ "message", () => this.formattedMessage ]
            ]);

            if (type == "table") {
                this.formattedMessage = "";
            } else if (type == "dir") {
                this.formattedMessage = formatWithOptions(params[0], message);
            } else {
                this.formattedMessage = formatWithOptions({ colors: true, depth: 2 }, message, ...params);
            }

            if (XMLogger.SETTINGS.usesPadding()) {
                templateTagPopulators.set("type-padding", () => " ".repeat(XMLogger.TYPE_PADDING - minTypeName.length));
                templateTagPopulators.set("env-padding", () => " ".repeat(Math.max(...XMLogger.SETTINGS.getEnvs().map((key) => key.length)) - env.length));
            } else {
                [ "type-padding", "env-padding" ].forEach((key) => templateTagPopulators.set(key, emptyString));
            }

            if (XMLogger.SETTINGS.usesDateTime()) {
                templateTagPopulators.set("date-time", () => correctedDate.toLocaleString("en-GB"));
                templateTagPopulators.set("date", () => correctedDate.toLocaleDateString("en-GB"));
                templateTagPopulators.set("time", () => correctedDate.toLocaleTimeString("en-GB"));
                templateTagPopulators.set("date-time-padding", () => " ");
            } else {
                [ "date-time", "date", "time", "date-time-padding" ].forEach((key) => templateTagPopulators.set(key, emptyString));
            }

            this.env = env;
            this.type = type;
            this.originalMessage = message;
            this.params = params;
            this.message = XMLogger.SETTINGS.getTemplate()
                .replace(/<(?<type>.*?)>/g, (original, type) => {
                    if (templateTagPopulators.has(type)) {
                        return templateTagPopulators.get(type)!();
                    } else {
                        return original;
                    }
                })
                .replace(/<(?<type>.*?)>/g, (original, type: keyof typeof ESCAPE_CODE_LIST) => {
                    if (type in ESCAPE_CODE_LIST) {
                        // Did you know \x1b[u is the code to restore the cursor position? I certainly found out the hard way with an undefined error
                        return `\x1b[${ESCAPE_CODE_LIST[type].toString()}m`;
                    } else {
                        return original;
                    }

                });
        } else {
            XMLogger.error("Console", "The environment <fg-red>%s</r> is not registered", env);

            throw new Error(`The environment ${env} is not registered`);
        }
    }

    private postLog(): void {
        const capture: LogHistory = <LogHistory>{
            env: this.env,
            type: this.type,
            message: this.message,
            original: this.originalMessage,
            formatted: this.formattedMessage
        };

        if (capture.type == "dir") {
            capture.options = this.params[0];
        } else if (capture.type == "table") {
            capture.columns = this.params[0];
        }

        XMLogger.CAPTURES.push(capture);

        this.emit("output");
        this.emit(this.env);
        this.emit(this.type);
    }

    private formatTags(tags: EscapeCodeTags): string {
        return tags.map((tag) => `<${tag}>`).join("");
    }

    private emit(event: LoggingType | "output" | string): void {
        const listeners = XMLogger.LISTENERS.get(event);

        listeners?.forEach((callback) => {
            try {
                if (this.type == "dir" || this.type == "table") {
                    callback(this.env, this.message, this.originalMessage, this.params[0]);
                } else {
                    callback(this.env, this.message);
                }
            } catch (error) {
                // Leeeets pretend this never happened
            }
        });
    }

    private toString(): string {
        return this.message;
    }
}
