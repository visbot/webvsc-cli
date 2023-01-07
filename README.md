# webvsc-cli

[![npm](https://flat.badgen.net/npm/license/@visbot/webvsc-cli)](https://www.npmjs.com/package/@visbot/webvsc-cli)
[![npm](https://flat.badgen.net/npm/v/@visbot/webvsc-cli)](https://www.npmjs.com/package/@visbot/webvsc-cli)
[![CI](https://img.shields.io/github/actions/workflow/status/idleberg/webvsc-cli/default.yml?style=flat-square)](https://github.com/idleberg/webvsc-cli/actions)

## Description

CLI tool to batch-convert [Winamp AVS presets](https://www.wikiwand.com/en/Advanced_Visualization_Studio) into native [Webvs](https://github.com/azeem/webvs) JSON format.

## Installation

Use your preferred [Node](https://nodejs.org) package manager to install the CLI globally

```sh
$ yarn global add @visbot/webvsc-cli || npm install --global @visbot/webvsc-cli
```

## Usage

### CLI

Once setup, you can run `webvsc --help` to list available options:

```
$ webvsc

Usage: cli [options] [command]

Options:
  -h, --help                   display help for command

Commands:
  convert [options] <file...>  convert presets to JSON format
  info [options] <file...>     show info about AVS presets
  help [command]               display help for command
```

Refer to the help for each sub-command to list its options.

#### `convert`

Converts presets to Webvs JSON format, support globs

**Example:**

```sh
$ webvsc convert ./**/*.avs
```



#### `info`

Show info about AVS presets

**Example:**

```sh
$ webvsc info pillow_fight.avs

File: dynamic duo - pillow fight.avs

Size: 5.22 kB
Modified: Sun, 04 Jan 2009 23:31:22 GMT
SHA-256: 3c8bc2778a433cd27d46e069b35412e954226be8beb358e867b28570285eea14

  Effects
  - BufferSave (1)
  - ColorClip (1)
  - Comment (1)
  - EffectList (1)
  - Invert (1)
  - Movement (1)

  APEs
  - ColorMap (1)
  - ConvolutionFilter (1)
  - TexerII (3)

  Images
  - avsres_texer_square_sharp_16x16.bmp (1)
  - avsres_texer_square_sharp_24x24.bmp (1)
  - avsres_texer_square_sharp_30x30.bmp (1)
```

### Troubleshooting

When trying to convert a large number of files, you might run into an `EMFILE` error. This is a well-documented [issue](https://github.com/nodejs/node/issues/1941) that occurs whenever the number of [maximum open files](http://blog.izs.me/post/56827866110/wtf-is-emfile-and-why-does-it-happen-to-me) exceeds its limit. In such a case, you can use the following as workaround.

```sh
# Bash
$ for dir in avs/*; do echo $dir; webvsc convert "$dir/**/*.avs" --quiet; done

# Windows
$ for /r %i in (avs/*) do webvsc convert %i --quiet
```

## License

All code is licensed under [The MIT License](http://opensource.org/licenses/MIT)
