Scalable JavaScript Application Example
=======================================

This application architecture is base on this:

 1. Andrew Dupont (Gowalla, Prototype.js, S2) **Maintainable JavaScript** http://channel9.msdn.com/Events/MIX/MIX11/EXT23
 2. Nicholas Zakas (Yahoo!, YUI, YUI Test) **Writing Maintainable JavaScript** http://www.yuiblog.com/blog/2007/05/25/video-zakas/ Slides: http://www.slideshare.net/nzakas/maintainable-javascript-2011 http://www.slideshare.net/nzakas/maintainable-javascript-1071179
 3. **Scalable JavaScript Application Architecture** http://developer.yahoo.com/yui/theater/video.php?v=zakas-architecture

The architecture of this application is described at Yandex.Subbotnik in Yekaterinburg

Video(ru): http://video.yandex.ru/users/ya-events/view/291/#hq

Slides(ru): http://www.slideshare.net/azproduction/making-scalable-javascript-application

Depends
-------

 - LMD v1.3.0+ (https://github.com/azproduction/lmd) `npm install lmd -g` - required for build
 - jQuery or Zepto.js - required for core modules (see index.html)

Build and run the example
-------------------------

1. `cd build && make`
2. open `index.html`

**Build makes only js files**

Running tests
-------------

1. `cd test && make`
2. open `test/index.html`

Changelog
---------

**v2.0**

 - **Modules as all application architecture are greatly simplified**
 - This app is now depend on LMD so all modules are synchronous
 - Added build system based on LMD (https://github.com/azproduction/lmd)
 - Core is finally splitted on 4 logical parts: Core, EventManager, Sandbox and Template engine
 - ModuleManager, loader and $script.js are wiped
 - Part of ModuleManager logic is moved to Core
 - All modules are loaded on startup (using lmd) so we no longer need a heavy loaders and $script.js
 - All application modules (not lib modules) are totally sandboxed (cant require at all)
 - Simple acl wildcards support `listen:*` and `*` but not `listen:ololo:*`

Licence
-------

(The MIT License)

Copyright (c) 2011 Mikhail Davydov <azazel.private@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.