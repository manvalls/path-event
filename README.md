# PathEvent

## Sample usage

```javascript
var PathEvent = require('path-event'),
    Emitter = require('y-emitter'),

    e = new Emitter();

e.target.on('/*',function(){
  console.log('default');
});

e.target.on('/foo/bar',function(){
  console.log('foobar');
});

e.target.on('/foo/*',function(){
  console.log('foo');
});

( new PathEvent('/foo/bar',e) ).next(); // foobar
( new PathEvent('/foo/baz',e) ).next(); // foo
( new PathEvent('/one/two',e) ).next(); // default

```
