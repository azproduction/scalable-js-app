/**
 * @description
 *
 *      This file generates config for LMD builder @see https://github.com/azproduction/lmd
 *      This file in depend on tmp/ dir created by Makefile and on ../index.json
 *
 * @usage
 *
 *      node ./make_lmd_config.js -v %ENVIRONMENT%;
 *      node ./make_lmd_config.js -v "production";
 *
 * @output
 *
 *      FILE: tmp/lmd.%ENVIRONMENT%.json
 *
 *      FILE CONTENT:
 *      {
 *          "path":"/",
 *          "global":"window",
 *          "main":"main",
 *          "modules":{
 *              // index.js file
 *              "main":"/absolute/path/to/index.js",
 *
 *              // Core modules
 *              "Core":"/absolute/path/to/lib/Core.js",
 *              "Template":"/absolute/path/to/lib/Template.js",
 *              "EventManager":"/absolute/path/to/lib/EventManager.js",
 *              "Sandbox":"/absolute/path/to/lib/Sandbox.js",
 *
 *              // "packed" modules resources. Each file contents: {"ModuleName": "resourceValue", ...}
 *              "locales":"/absolute/path/to/build/tmp/locales.json",
 *              "templates":"/absolute/path/to/build/tmp/templates.json",
 *              "descriptors":"/absolute/path/to/build/tmp/descriptors.json",
 *
 *               // application descriptor
 *              "descriptor":"/absolute/path/to/index.json",
 *
 *              // list of all app modules declared in "descriptor"
 *              "MessageView":"/absolute/path/to/app/modules/MessageView.js",
 *              "DataGenerator":"/absolute/path/to/app/modules/DataGenerator.js",
 *              "Logger":"/absolute/path/to/app/modules/Logger.js",
 *              "Hook":"/absolute/path/to/app/modules/Hook.js"
 *              // other modules...
 *          },"
 *          sandbox":{
 *              "MessageView":true,
 *              "DataGenerator":true,
 *              "Logger":true,
 *              "Hook":true
 *          },
 *          "lazy":true, // value depend on -v
 *          "pack":true  // value depend on -v
 *      }
 */

var APP_CONFIG = __dirname + '/../index.json',
    BASE_DIR = __dirname + '/../',
    TMP_DIR = __dirname + '/tmp/';

var fs = require('fs');

var parameters = (function(a,b,c,d){c={};for(a=a.split(/\s*\B[\/-]+([\w-]+)[\s=]*/),d=1;b=a[d++];c[b]=a[d++]||!0);return c})
                 (process.argv.join(' '));

var IS_PRODUCTION = parameters.v === 'production';

var appConfig = JSON.parse(fs.readFileSync(APP_CONFIG, 'utf8'));

var collect = function (what, is_json) {
    var items = {};

    appConfig.modules.forEach(function (moduleName) {
        var file = BASE_DIR + appConfig.path[what] + moduleName + (is_json ? '.json' : '.html');
        try {
            var item = fs.readFileSync(file, 'utf8');
            items[moduleName] = is_json ? JSON.parse(item) : item;
        } catch (e) {
            // ignore if not found
        }
    });

    return JSON.stringify(items);
};

var collectModules = function () {
    fs.writeFileSync(TMP_DIR + 'locales.json', collect('locale', true), 'utf8');
    fs.writeFileSync(TMP_DIR + 'templates.json', collect('template', false), 'utf8');
    fs.writeFileSync(TMP_DIR + 'descriptors.json', collect('descriptor', true), 'utf8');

    var modules = {
        "main": fs.realpathSync(BASE_DIR + "index.js"),

        "Core": fs.realpathSync(BASE_DIR + "lib/Core.js"),
        "Template": fs.realpathSync(BASE_DIR + "lib/Template.js"),
        "EventManager": fs.realpathSync(BASE_DIR + "lib/EventManager.js"),
        "Sandbox": fs.realpathSync(BASE_DIR + "lib/Sandbox.js"),

        "locales": fs.realpathSync(TMP_DIR + 'locales.json'),
        "templates": fs.realpathSync(TMP_DIR + 'templates.json'),
        "descriptors": fs.realpathSync(TMP_DIR + 'descriptors.json'),
        "descriptor": fs.realpathSync(BASE_DIR + "index.json")
    };

    appConfig.modules.forEach(function (moduleName) {
        modules[moduleName] = fs.realpathSync(BASE_DIR + appConfig.path.module + moduleName + '.js');
    });

    return modules;
};

var collectSandboxedModules = function () {
    var modules = {};

    appConfig.modules.forEach(function (moduleName) {
        modules[moduleName] = true;
    });

    return modules;
};

var lmd_config = {
    "path": "/",
    "global": "window", // define to be sure
    "main": "main",
    "modules": collectModules(),
    "sandbox": collectSandboxedModules(),
    "lazy": IS_PRODUCTION,
    "pack": IS_PRODUCTION
};

fs.writeFileSync(TMP_DIR + 'lmd.' + parameters.v + '.json', JSON.stringify(lmd_config), 'utf8');