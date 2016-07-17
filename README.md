# transcode-less package

Simple and configurable [less to css](http://lesscss.org/) transcoder

transcode-less package is based upon **lessconfig.json** configuration file.

## lessconfig.json

**lessconfig.json** is a one place configuration file, that can be used by any
less IDE plugin transcoder.

Options:

 * outDir (string)[optional]
   > Define the output directory for transcoded files. If not set, css file will
   > be create in the same folder of less source.
   > Relative path are resolved from the *lessconfig.json* file location.

 * plugins (object)[optional]
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
   }```
