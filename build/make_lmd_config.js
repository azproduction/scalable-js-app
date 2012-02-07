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

var lmd_config = {
    "path": "/",
    "main": "main",
    "modules": collectModules(),
    "lazy": IS_PRODUCTION,
    "pack": IS_PRODUCTION
};

fs.writeFileSync(TMP_DIR + 'lmd.' + parameters.v + '.json', JSON.stringify(lmd_config), 'utf8');