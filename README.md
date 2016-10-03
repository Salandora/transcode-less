# transcode-less package

[Atom](https://atom.io/) package for less to css file transcoding, with [lesscss](http://lesscss.org/) plugins support.

**transcode-less** is simple and configurable. It uses `lessconfig.json` for
transcoding options. Every *lesscss* options are supported.
The **plugins** parameter has been improved to dynamically load any
less plugin (see [less plugin in npm](https://www.npmjs.com/search?q="less-plugin"))

This package is under [CeCILL-C](http://www.cecill.info/licences/Licence_CeCILL-C_V1-en.txt) license.

## Features

Less files are automatically transcoded on save. The transcoder looks for a `lessconfig.json` file
browsing up until one of base project directories has been reached. If none of them contains a
`lessconfig.json` file, default options are used.

**Transcoder less** dynamically loads specifyed less plugin. Any npm less plugin package can be
used.


`Transcode all` action, transcodes every less files related to a `lessconfig.json` (less file for
  which there is a `lessconfig.json` in one of their parents directories) into css file. (This feature behaviour could change in the future)

## lessconfig.json

**lessconfig.json** is a one place configuration file, that can be used by any
less IDE plugin transcoder.

Options:

 * *rootDir* (string)[optional]
   > Used to resolve output file path.
   > The path of the input less file is relativized using this options
   > and then made absolute using the *outDir* option.
   > Ex:
   > ```json
   {
      "rootDir": "./less",
      "outDir": "../www/styles"
   }
   // /path/to/src/less/file.less => /path/to/www/styles/file.css
   // /path/to/src/less/theme/file.less => /path/to/www/styles/theme/file.css
   ```
   > ```json
   {
      "outDir": "../www"
   }
   // /path/to/src/styles/file.less => /path/to/www/styles/file.css
   // /path/to/src/styles/theme/file.less => /path/to/www/styles/theme/file.css
   ```


 * *outDir* (string)[optional]
   > Define the output directory for transcoded files. If not set, css file will
   > be create in the same folder of the less source file.
   > Relative path are resolved from the *lessconfig.json* file location.

 * *paths* (string[])[optional]
   > List of include paths for less rendering. More about it on
   > [lesscss.org](http://lesscss.org/usage/#command-line-usage-include-paths).
   > The main difference with the orignal option is that the transcoded file
   > location is automatically added if empty.

 * *plugins* (object)[optional]
   > Extra less plugin configuration.
   >
   > Ex:
   > ```json
   {
      "plugins": {
          "less-plugin-clean-css": {
              "advanced": true
          }
      }
   }
   ```

 * Any other lesscss options (except for plugins)
   > See [lesscss doc](http://lesscss.org/usage/#command-line-usage-options)

## Todo

 * Specify excluded directories and/or files (resp. included)
