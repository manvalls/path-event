# PathEvent [![Build Status][ci-img]][ci-url] [![Coverage Status][cover-img]][cover-url]

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

As you can see, all flows start with the `*` event. You can use it for logging or filtering purposes or just ignore it. Then, the original path is emitted as an event. The flow continues until the `/*` event is reached. Take a look at the following example:

```javascript

target.on('/animals/dogs/*',function*(e){
  var breed = e.argv(1)[0];

  yield e.take();
  if(breed == 'chihuahua'){

    e.give();  // Ignore chihuahuas
    yield e.take();  // If everyone else ignores it,
                          // take it back

    console.log('nobody likes this one!');
    return;
  }

  console.log('got a dog!');

});

target.on('/animals/*',function(e){
  var colour = e.argv(3)[2];

  yield e.take();
  if(colour == 'black'){
    e.give();  // I can't see black animals
    return;
  }

  console.log('got an animal!');

});

```

Consider these three events:

- `/animals/dogs/husky/black`
- `/animals/dogs/chihuahua/white`
- `/animals/dogs/chihuahua/black`

The console output of those three events would be, respectively:

- `got a dog!`
- `got an animal!`
- `nobody likes this one!`

[ci-img]: https://circleci.com/gh/manvalls/path-event.svg?style=shield
[ci-url]: https://circleci.com/gh/manvalls/path-event
[cover-img]: https://coveralls.io/repos/manvalls/path-event/badge.svg?branch=master&service=github
[cover-url]: https://coveralls.io/github/manvalls/path-event?branch=master
