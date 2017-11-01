# webvsc

[![npm](https://img.shields.io/npm/l/@visbot/webvsc-cli.svg?style=flat-square)](https://www.npmjs.com/package/@visbot/webvsc-cli)
[![npm](https://img.shields.io/npm/v/@visbot/webvsc-cli.svg?style=flat-square)](https://www.npmjs.com/package/@visbot/webvsc-cli)
[![Travis CI](https://img.shields.io/travis/idleberg/webvsc-cli/typescript.svg?style=flat-square)](https://travis-ci.org/idleberg/webvsc-cli)
[![David](https://img.shields.io/david/idleberg/webvsc-cli.svg?style=flat-square)](https://david-dm.org/idleberg/webvsc-cli)
[![David](https://img.shields.io/david/dev/idleberg/webvsc-cli.svg?style=flat-square)](https://david-dm.org/idleberg/webvsc-cli?type=dev)

## Description

CLI tool to batch-convert [Winamp AVS presets](https://www.wikiwand.com/en/Advanced_Visualization_Studio) into native [Webvs](https://github.com/azeem/webvs) JSON format.

## Installation

### npm

Use your preferred [Node](https://nodejs.org) package manager to install the CLI globally

```sh
$ yarn global add @visbot/webvsc-cli || npm install --global @visbot/webvsc-cli
```

## Usage

### CLI

Once setup, you can run `webvsc --help` to list available options. Alternatively, use `node build/cli.js`.

```
$ webvsc

  Usage: webvsc [options] <file(s)>

  Options:

    -V, --version    output the version number
    -v, --verbose    print more information, can be set multiple times to increase output
    -m, --minify     minify generated JSON
    -q, --quiet      print errors only
    -n, --no-hidden  don't extract hidden strings from fixed-size strings
    -h, --help       output usage information
```

Commonly, you would run `webvsc "avs/**/*.avs"` to convert a bunch of presets, or just one. When using wildcards, it's important to wrap the path in quotes.

### Troubleshooting

When converting thousands of presets, you might run into `EMFILE` errors. In that case try the following workaround:

```sh
$ for dir in avs/*; do echo $dir; webvsc "$dir/**/*.avs" --silent; done
```

## License

All code is licensed under [The MIT License](http://opensource.org/licenses/MIT)
