import type { InspectOptions } from "util";
import type { EscapeCodeTags } from "./types/EscapeCodeTags";
import type { LoggingType } from "./types/LoggingType";
import { format, formatWithOptions } from "util";
import { ESCAPE_CODE_LIST } from "./statics/EscapeCodeList";

export class XMLogger {

    private static readonly TYPE_TAGS = new Map<LoggingType, EscapeCodeTags>([
        [ "log", [ "fg-steel-blue" ] ],
        [ "info", [ "fg-steel-blue" ] ],
        [ "warn", [ "pfg-yellow" ] ],
        [ "debug", [ "sfg-cyan" ] ],
        [ "error", [ "fg-dark-red" ] ],
        [ "trace", [ "fg-dark-red" ] ],
        [ "traceInfo", [ "fg-steel-blue" ] ],
        [ "dir", [ "fg-steel-blue" ] ],
        [ "table", [ "fg-steel-blue" ] ],
        [ "time", [ "fg-steel-blue" ] ],
        [ "timeEnd", [ "fg-steel-blue" ] ],
        [ "assertSuccess", [ "sfg-green" ] ],
        [ "assertFailure", [ "fg-dark-red" ] ],
        [ "clear", [ "sfg-magenta" ] ]
    ]);

    private static readonly ENVIRONMENTS = new Map<string, EscapeCodeTags>([
        [ "Console", [ "bold", "fg-dark-red" ] ]
    ]);

    private static readonly LISTENERS = new Map<LoggingType | "output" | string, ((message: string) => any)[]>();

    private static readonly TIMERS = new Map<string, number>();

    private static readonly CAPTURES = new Array<string>();

    private static readonly TYPE_PADDING = Math.max(...[ ...XMLogger.TYPE_TAGS.keys() ].map((key) => key.split(/[A-Z]/)[0].length));

    private static WITH_PADDING = true;

    private static WITH_DATE = true;

    public static togglePadding(state: boolean): void {
        XMLogger.WITH_PADDING = state;
    }

    public static toggleDate(state: boolean): void {
        XMLogger.WITH_DATE = state;
    }

    public static registerEnv(tag: string, ...escapeCodeTags: EscapeCodeTags): void {
        this.ENVIRONMENTS.set(tag, escapeCodeTags);
    }

    public static setTypeColors(type: LoggingType, ...escapeCodeTags: EscapeCodeTags): void {
        XMLogger.TYPE_TAGS.set(type, escapeCodeTags);
    }

    public static on(type: LoggingType | "output" | string, callback: (message: string) => any): void {
        if (XMLogger.LISTENERS.has(type)) {
            XMLogger.LISTENERS.get(type)!.push(callback);
        } else {
            XMLogger.LISTENERS.set(type, [ callback ]);
        }
    }

    public static getOutput(): string[] {
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
        const instance = new XMLogger("dir", env, formatWithOptions({
            colors: true,
            depth: Infinity,
            ...options
        }, message));

        console.info(instance.toString());
        instance.postLog();
    }

    public static table(env: string, tabularData: any[] | Record<any, any>, properties?: string[]): void {
        const instance = new XMLogger("table", env, "");

        console.info(instance.toString());
        // IDC that this doesn't log everything in the events, someone else can try telling an event what these edge case filled tables look like
        console.table(tabularData, properties);
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

    public static assert<T>(env: string, assertion: any, ...params: T[]): void {
        let instance;

        if (assertion) {
            instance = new XMLogger("assertSuccess", env, "Successful assertion", ...params);

            console.info(instance.toString());
        } else {
            instance = new XMLogger("assertFailure", env, "Assertion failed", ...params);

            console.trace(instance.toString());
        }

        instance.postLog();
    }

    public static clear(env: string): void {
        const instance = new XMLogger("clear", env, "The console was cleared");

        XMLogger.CAPTURES.splice(0, XMLogger.CAPTURES.length);
        console.clear();
        console.info(instance.toString());
        instance.postLog();
    }

    private readonly env: string;

    private readonly name: string;

    private readonly message: string;

    private constructor(name: LoggingType, env: string, message: any, ...params: any[]) {
        if (XMLogger.ENVIRONMENTS.has(env)) {
            const baseDate = new Date();
            const correctedDate = new Date(baseDate.setMinutes(baseDate.getMinutes() + baseDate.getTimezoneOffset()));
            const typeTags = this.formatTags(XMLogger.TYPE_TAGS.get(name)!);
            const envTags = this.formatTags(XMLogger.ENVIRONMENTS.get(env)!);

            this.env = env;
            this.name = name;
            this.message = format(
                "<%s>%s</r> [<%s>%s</r>%s] [%s%s%s</r>]: %s",
                typeTags,
                XMLogger.WITH_DATE ? correctedDate.toLocaleString("en-GB") : correctedDate.toLocaleTimeString("en-GB"),
                typeTags,
                name.split(/[A-Z]/)[0].toUpperCase(),
                XMLogger.WITH_PADDING ? " ".repeat(XMLogger.TYPE_PADDING - name.length) : "",
                XMLogger.WITH_PADDING ? " ".repeat(Math.max(...[ ...XMLogger.ENVIRONMENTS.keys() ].map((key) => key.length)) - env.length) : "",
                envTags,
                env,
                formatWithOptions({ colors: true, depth: 2 }, message, ...params)
            ).replace(/<(?<type>.*?)>/g, (original, type: keyof typeof ESCAPE_CODE_LIST) => {
                if (ESCAPE_CODE_LIST[type]) {
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
        XMLogger.CAPTURES.push(this.message);
        this.emit("output", this.message);
        this.emit(this.env, this.message);
        this.emit(this.name, this.message);
    }

    private formatTags(tags: EscapeCodeTags): string {
        return tags.map((tag) => `<${tag}>`).join("");
    }

    private emit(event: LoggingType | "output" | string, message = ""): void {
        const listeners = XMLogger.LISTENERS.get(event);

        listeners?.forEach((callback, index) => {
            try {
                callback(message);
            } catch (error) {
                // Handling destroyed callbacks
                listeners.splice(index, 1);
            }
        });
    }

    private toString(): string {
        return this.message;
    }
}
