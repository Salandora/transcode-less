# transcode-less package

[Atom](https://atom.io/) package for less to css file transcoding, with [lesscss](http://lesscss.org/) plugins support.

**transcode-less** is simple and configurable. It uses `lessconfig.json` for
transcoding options. Every *lesscss* options are supported.
The **plugins** parameter has been improved to dynamically load less plugin.

Since release 0.3.0, [npm](https://www.npmjs.com/package/npm) dependency has been
removed. The desired less plugin has to be an installed dependency of your project.

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
   >
   > By default *rootDir* is the deepest directory which contains every less files, starting from the `lessconfig.json` file.
   >
   > Ex:
   > > ```txt
   Project
   |- src
   |  |- scripts
   |  |  |- project.js
   |  |  \ ...
   |  \- styles
   |     |- project.less
   |     \ ...
   |- lessconfig.json
   \- ...
   ```
   > > Default *rootDir* will be `Project/src/styles`
   >
   > Ex:
   > > ```txt
   Project
   |- src
   |  |- scripts
   |  |  |- project.js
   |  |  \ ...
   |  |- styles
   |  |  |- project.less
   |  |  \ ...
   |  \- theme
   |     |- light.less
   |     \ ...
   |- lessconfig.json
   \- ...
   ```
   > > Default *rootDir* will be `Project/src`
   >
   > Ex:
   > > With *rootDir* as `.../Project/src/less` and *outDir* as `.../Project/www/css`, we get
   > >
   > > .../Project/src/less/file.less -> .../Project/www/css/file.css
   >
   > > .../Project/src/less/theme/file.less -> .../Project/www/css/theme/file.css

   > Ex:
   > > With *rootDir* as `.../Project/src` and *outDir* as `.../Project/www/css`, we get
   > >
   > > .../Project/src/styles/file.less -> .../Project/www/css/styles/file.css

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
   >
   > > lessconfig.json
   > > ```json
   {
     "plugins": {
       "less-plugin-clean-css": {
         "advanced": true
       }
     }
   }
   ```
   > > package.json
   > > ```json
   {
     ...,
     "devDependencies": {
       "less-plugin-clean-css": "*"
     }
   }
   ```

 * Any other lesscss options (except for plugins)
   > See [lesscss doc](http://lesscss.org/usage/#command-line-usage-options)

## Todo

 * Specify excluded directories and/or files (resp. included)
