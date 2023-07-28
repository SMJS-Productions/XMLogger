import type { EscapeCodeTags } from "./types/EscapeCodeTags";
import type { LoggingType } from "./types/LoggingType";

export class Settings {

    private readonly typeTags: Map<LoggingType, EscapeCodeTags>;

    public readonly environments: Map<string, EscapeCodeTags>;

    private usePadding: boolean;

    private useDate: boolean;

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
        this.usePadding = true;
        this.useDate = true;
    }

    public togglePadding(state: boolean): void {
        this.usePadding = state;
    }

    public usesPadding(): boolean {
        return this.usePadding;
    }

    public toggleDate(state: boolean): void {
        this.useDate = state;
    }

    public usesDate(): boolean {
        return this.useDate;
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
