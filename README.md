# PathEvent

The `PathEvent` class contains the logic behind the ending asterisk path strategy. Think of the event flow as an assembly line: when each listener is done with the event, it forwards it to the next one, until one of it decides that the event is fully handled and stops the flow.

Let's suppose our path is `/what/an/example/this/is`. With this example, the following events will be emitted, one after another:

```
*
/what/an/example/this/is
/what/an/example/this/*
/what/an/example/*
/what/an/*
/what/*
/*
```

As you can see, all flows start with the `*` event. You can use it for logging or filtering purposes or just ignore it. Then, the original path is emitted as an event. The flow continues until the `/*` event is reached.

The content of the events is an array of three elements. These are, in order of occurrence:

- The **PathEvent** object
- The **remaining parts**
- The **remaining string**

If we were listening for the `/what/an/*` event, our array would be:

```javascript
[ pathEvent, ['example','this','is'], 'example/this/is' ]
```

The `PathEvent` class has two methods: `next` and `finally`. Take a look at the following example:

```javascript

target.on('/animals/dogs/*',function*([ ev, [breed] ]){

  if(breed == 'chihuahua'){
    ev.next(); // Ignore chihuahuas

    yield ev.finally(); // If everyone else ignores it,
                        // take it back

    console.log('nobody likes this one!');
    return;
  }

  console.log('got a dog!');

});

target.on('/animals/*',function([ ev, [species, breed, colour] ]){

  if(colour == 'black'){
    ev.next(); // I can't see black animals
    return;
  }

  console.log('got an animal!');

});

```

Consider these three events:

- `/animals/dogs/husky/black`
- `/animals/dogs/chihuahua/white`
- `/animals/dogs/chihuahua/black`

Take another close look at the example. The `next` call continues the event flow, and the `finally` call returns a `Promise/A+` that gets accepted when the event flow gets past its last listener. Note that final promises have their own independent flow. That being said, the console output of those three events would be, respectively:

- `got a dog!`
- `got an animal!`
- `nobody likes this one!`

Note that if you use `target.until()` you'll skip the flow queue unless you *double yield*, e.g:

```javascript

target.walk(function*(){
  var arr = yield this.until('/*'), // out of queue
      [ev] = yield arr; // queued

  console.log(ev == arr[0]); // true
});

```
