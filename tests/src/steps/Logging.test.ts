/* eslint-disable */
import type { DataTable } from "@cucumber/cucumber";
import type { LogHistory } from "../../../src/types/LogHistory";
import type { LoggingWorld } from "../worlds/LoggingWorld";
import { Before, Given, Then, When } from "@cucumber/cucumber";
import { XMLogger } from "../../../src/XMLogger";
import { assert } from "chai";

Before<LoggingWorld>(function() {
    XMLogger.SETTINGS.toggleDateTime(true);
    XMLogger.SETTINGS.togglePadding(true);
    XMLogger["CAPTURES"].splice(0, XMLogger["CAPTURES"].length);
    this.history = [];
});

Given<LoggingWorld>("I register an environment with the name {string}", function(env: string) {
    XMLogger.SETTINGS.registerEnv(env);
});

Given<LoggingWorld>("I disable date-time", function() {
    XMLogger.SETTINGS.toggleDateTime(false);
});

Given<LoggingWorld>("I disable padding", function() {
    XMLogger.SETTINGS.togglePadding(false);
});

Given<LoggingWorld>("I log {string} using the dir method and the environment {string}", function(message: string, env: string) {
    XMLogger.dir(env, JSON.parse(message));
});

Given<LoggingWorld>("I log {string} using the table method and the environment {string}", function(message: string, env: string) {
    XMLogger.table(env, JSON.parse(message));
});

Given<LoggingWorld>("I log {string} using the {string} method and the environment {string}", function(message: string, method: "log" | "info" | "warn" | "debug" | "error" | "trace" | "traceInfo", env: string) {
    XMLogger[method](env, message);
});

Given<LoggingWorld>("I log {string} using the {string} method and the environment {string} with the params:", function(message: string, method: "log" | "info" | "warn" | "debug" | "error" | "trace" | "traceInfo", env: string, table: DataTable) {
    XMLogger[method](env, message, ...table.hashes().map(({ param }) => param));
});

When<LoggingWorld>("I get the log history", function() {
    this.history = XMLogger.getOutput(); 
});

Then<LoggingWorld>("the log history should have {int} entries", function(count: number) {
    assert.equal(this.history.length, count);
});

Then<LoggingWorld>("the history entries should be:", function(table: DataTable) {
    table.hashes().forEach((row, index) => Object.keys(row).forEach((key) => {
        assert.equal(this.history[index][<keyof LogHistory>key], row[key], `Value for key ${key} does not match at index ${index}`);
    }));
});

Then<LoggingWorld>("the parsed history entries should be:", function(table: DataTable) {
    table.hashes().forEach((row, index) => Object.keys(row).forEach((key) => {
        if (key === "original") {
            assert.deepEqual(this.history[index][<keyof LogHistory>key], JSON.parse(row[key]), `Value for key original does not match at index ${index}`);
        } else {
            assert.equal(this.history[index][<keyof LogHistory>key], row[key], `Value for key ${key} does not match at index ${index}`);
        }
    }));
});