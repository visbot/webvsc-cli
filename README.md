# @visbot/webvsc-cli

[![License](https://img.shields.io/github/license/visbot/webvsc-cli?color=blue&style=for-the-badge)](https://github.com/visbot/webvsc-cli/blob/main/LICENSE)
[![Version](https://img.shields.io/npm/v/@visbot/webvsc-cli?style=for-the-badge)](https://www.npmjs.org/package/@visbot/webvsc-cli)
[![Build](https://img.shields.io/github/actions/workflow/status/visbot/webvsc-cli/default.yml?style=for-the-badge)](https://github.com/visbot/webvsc-cli/actions)

## Description

CLI tool to batch-convert [Winamp AVS presets](https://www.wikiwand.com/en/Advanced_Visualization_Studio) into native [Webvs](https://github.com/azeem/webvs) JSON format.

## Installation

Use your preferred [NodeJS](https://nodejs.org) package manager to install the CLI globally

```sh
$ npm install --global @visbot/webvsc-cli
```

To use the tool without installation, you can use the `npx` command:

```sh
$ npx @visbot/webvsc-cli
```

## Usage

### CLI

Once setup, you can run `webvsc --help` to list available options:

```txt
Usage: webvsc [options] [command]

Options:
  -h, --help                          display help for command

Commands:
  convert [options] <file...>         convert presets to JSON format, supports glob patterns
  info [options] <file...>            show info about AVS presets, supports glob patterns
  diff [options] <preset1> <preset2>  approximates similarity between two AVS presets
  help [command]                      display help for command
```

Refer to the help for each sub-command to list its options.

#### `convert`

Converts presets to Webvs JSON format

**Example:**

```sh
$ webvsc convert ./Plugins/avs/**/*.avs
```

#### `info`

Show list of effects and assets used by a preset

**Example:**

```sh
$ webvsc info example.avs
$ webvsc info ./Plugins/avs/**/*.avs --summary
```

#### `diff`

Approximates the difference between two presets

**Example:**

```sh
$ webvsc diff -mld preset1.avs preset2.avs
```

:warning: This command requires additional flags to be set, see `webvsc diff --help` for details.

### Troubleshooting

When trying to convert a large number of files, you might run into an `EMFILE` error. This is a well-documented [issue](https://github.com/nodejs/node/issues/1941) that occurs whenever the number of [maximum open files](http://blog.izs.me/post/56827866110/wtf-is-emfile-and-why-does-it-happen-to-me) exceeds its limit. In such a case, you can use the following as workaround.

**Linux/macOS**

```sh
$ for dir in avs/*; do echo $dir; webvsc convert "$dir/**/*.avs" --quiet; done
```

**Windows**

```powershell
$ Get-ChildItem -Path .\avs\ -Recurse | ForEach-Object { webvsc convert $_.FullName --quiet }
```

## License

All code is licensed under [The MIT License](http://opensource.org/licenses/MIT)
