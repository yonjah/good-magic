# DEPRECATED -  No longer maintained
# good-magic
A dynamic Hapijs good reporter that can change logging level and type on a live server without restart

## Install
No npm package for now so use git
```sheel
git clone https://github.com/yonjah/good-magic.git
cd good-magic
npm install
```

## Usage
`Magic` is not like other reporters you will need to get a `Magic` object before passing it on to `Good`.
Once you have a `Magic` Object pass its reporter to `Good` as you would with any other `good-reporter`.  The only arg is an object with another reporter settings.

Lets create a Magic reporter wrapping `good-console`
```javascript
var hapi        = require('hapi'),
    server      = new hapi.Server(),
    good        = require('good'),
    goodConsole = require('good-console'),
    goodMagic   = require('good-magic'),

server.connection({ host: 'localhost' });
magic = goodMagic();

server.register({
        register: good,
        options: {
            reporters: [{
                    reporter: magic.Reporter
                    args:[{
                        reporter: goodConsole,
                        args:[{
                            log     : ['info']
                        }]
                    }]
                }]
        }
}, function (err) {
    if (err) {
        throw err;
    }
    server.start(function () {
        server.log('info', 'Server started at ' + server.info.uri);
        server.log('error', 'You wont see this ');
    });
});
```

Now when we have a `Magic` reporter wrapping `good-console` and you should see that it started on the console.
You wont see the error in the console since we are only logging `info` typed logs.

But what if we want to have a way to see the `error` log ? or maybe even other stuff like `ops` well thats exactly why we need Magic.
we can add a route that will call `magic.update` and change our log level
```javascript
server.route({
    method: 'GET',
    path: '/debug',
    handler: function debugHandler (request, reply) {
        var events = {
            log     : '*',
            error   : '*',
            ops     : '*'
        };
        magic.update(goodConsole, [events], function(){
            server.log('info', 'Updated log level: ' + JSON.stringify(events));
            server.log('error', 'You will now see this Error');
            reply();
        });
    }
});
```

On production system you might want to limit the access to this route for a specific IP (like only allow request from localhost)
