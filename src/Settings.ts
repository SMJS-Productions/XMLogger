import type { EscapeCodeTags } from "./types/EscapeCodeTags";
import type { LoggingType } from "./types/LoggingType";

export class Settings {

    private readonly typeTags: Map<LoggingType, EscapeCodeTags>;

    public readonly environments: Map<string, EscapeCodeTags>;

    private useDateTime: boolean;

    private usePadding: boolean;

    private template: string;

    constructor() {
        this.typeTags = new Map([
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
        this.environments = new Map([
            [ "Console", [ "bold", "fg-dark-red" ] ]
        ]);
        this.useDateTime = true;
        this.usePadding = true;
        this.template = "<type-tags><date-time></r><date-time-padding>[<type-tags><type></r><type-padding>] [<env-padding><env-tags><env></r>]: <message>";
    }

    public togglePadding(state: boolean): void {
        this.usePadding = state;
    }

    public usesPadding(): boolean {
        return this.usePadding;
    }

    public toggleDateTime(state: boolean): void {
        this.useDateTime = state;
    }

    public usesDateTime(): boolean {
        return this.useDateTime;
    }

    /**
     * @param template Supports the following tags:
     * - `<type>`: The type of the log.
     * - `<type-tags>`: The tags of the log type (Should be ended with a </r>).
     * - `<type-padding>`: The additional padding of the log type.
     * - `<env>`: The environment of the log.
     * - `<env-tags>`: The tags of the log environment (Should be ended with a </r>).
     * - `<env-padding>`: The additional padding of the log environment.
     * - `<date-time>`: The date and time of the log.
     * - `<date>`: The date of the log.
     * - `<time>`: The time of the log.
     * - `<date-time-padding>` An additional space which can be ignored if date-time is disabled.
     * - `<message>`: The message of the log.
     * - `</r>`: Resets the tags of the log.
     * - All other color tags are supported.
     */
    public setTemplate(template: string): void {
        this.template = template;
    }

    public getTemplate(): string {
        return this.template;
    }

    public setTypeColors(type: LoggingType, ...escapeCodeTags: EscapeCodeTags): void {
        this.typeTags.set(type, escapeCodeTags);
    }

    public getTypeTags(type: LoggingType): EscapeCodeTags {
        return this.typeTags.get(type)!;
    }

    public getTypes(): LoggingType[] {
        return [ ...this.typeTags.keys() ];
    }

    public registerEnv(tag: string, ...escapeCodeTags: EscapeCodeTags): void {
        this.environments.set(tag, escapeCodeTags);
    }

    public hasEnv(env: string): boolean {
        return this.environments.has(env);
    }

    public getEnvTags(env: string): EscapeCodeTags | undefined {
        return this.environments.get(env);
    }

    public getEnvs(): string[] {
        return [ ...this.environments.keys() ];
    }
}
