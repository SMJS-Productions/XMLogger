import type { World } from "@cucumber/cucumber";
import type { LogHistory } from "../../../src/types/LogHistory";

export interface LoggingWorld extends World {
    history: LogHistory[];
}
