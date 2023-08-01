# XMLogger

A logging system with detailed logging info and a simple interface with markup support.

## Features

- [x] Detailed logging info e.g. date-time, environment, type, and formatted messages
- [x] A simple interface which allows you to easily add new environments and format messages using a combination of markup and composite formatting
- [x] Event callback and log history support to access the logs programmatically
- [x] Customizable log components

## Settings

XMLogger comes with a few settings that allow you to customize the logs to your liking. You can access the settings by calling `XMLogger.SETTINGS`.

### Toggle padding

By default, XMLogger will add padding to the log type and environment to align the logs for readability. You can toggle this by calling `XMLogger.SETTINGS.togglePadding`.

### Toggle date-time

By default, XMLogger will add the date-time to the logs. You can toggle this by calling `XMLogger.SETTINGS.toggleDateTime`.

### Overwriting the template

Overwrites the default template of the logs. You can set the template by calling `XMLogger.SETTINGS.setTemplate`. The following tags are available:

- `<type>`: The type of the log.
- `<type-tags>`: The tags of the log type (Should be ended with a `</r>`).
- `<type-padding>`: The additional padding of the log type.
- `<env>`: The environment of the log.
- `<env-tags>`: The tags of the log environment (Should be ended with a `</r>`).
- `<env-padding>`: The additional padding of the log environment.
- `<date-time>`: The date and time of the log.
- `<date>`: The date of the log.
- `<time>`: The time of the log.
- `<date-time-padding>` An additional space which can be ignored if date-time is disabled.
- `<message>`: The message of the log.
- `</r>`: Resets the tags of the log.
- All other [tags](src/statics/EscapeCodeList.ts) are supported.

You can reset the template by calling `XMLogger.SETTINGS.resetTemplate`.

### Overwriting log type tags

You can overwrite the default tags of a log type by calling `XMLogger.SETTINGS.setLogTypeTags`.

### Registering an environment

You can register an environment by calling `XMLogger.SETTINGS.registerEnv`. These can be used as the first parameter of a log method.

## Usage

### Basics

The XMLogger comes with a lot of simple logging methods. These methods are:

- `log`: Logs a message on stdout.
- `info`: Logs an info message on stdout.
- `warn`: Logs a warning message on stdout.
- `error`: Logs an error message on stderr.
- `debug`: Logs a debug message on stdout.
- `trace`: Logs an error message with a trace on stderr.
- `traceInfo`: Logs a message with a trace on stdout.
- `clear`: Clears the console and follows up with a stdout message to indicate the clear.

Some of the more complex methods are:

- `dir`: Logs a detailed representation of an object on stdout.
- `table`: Logs a table on stdout.
- `time`: Starts a timer with a given name.
- `timeEnd`: Ends a timer with a given name and logs the time it took to complete on stdout.
- `assert`: Asserts a given message and either logs a success response on stdout or a failure response on stderr.

### Markup

XMLogger supports its own version of markup. The markup syntax is based on XML but with `</r>` as the closing tag. You can find all supported markup in the [escape code list](src/statics/EscapeCodeList.ts).

Example:

```ts
XMLogger.SETTINGS.registerEnv("test", "sfg-green", "italic");
XMLogger.log("test", "<bold><sfg-red>I'm a bold red log</r>");
```
