# PathEvent

## Sample usage

```javascript
var PathEvent = require('path-event'),
    Emitter = require('y-emitter'),
    
    e = new Emitter();

e.target.on('/*',function(pe){
  console.log('default');
});

e.target.on('/foo/bar',function(pe){
  console.log('foobar');
});

e.target.on('/foo/*',function(pe){
  console.log('foo');
});

( new PathEvent('/foo/bar',e) ).next(); // foobar
( new PathEvent('/foo/baz',e) ).next(); // foo
( new PathEvent('/one/two',e) ).next(); // default

```
