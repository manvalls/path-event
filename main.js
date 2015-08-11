var Lock = require('y-lock'),
    define = require('u-proto/define'),

    lock = Symbol();

function PathEvent(path,e,max){
  var remaining = path.split('/'),
      rest;

  this[lock] = new Lock(0);

  e.give('*',[this,remaining.slice(1)],this[lock]);
  e.give(path,[this,[]],this[lock]);

  if(max != null && remaining.length > --max){
    rest = remaining.slice(max);
    remaining = remaining.slice(0,max);
  }else rest = [];

  while(remaining.length > 1){
    rest.unshift(remaining.pop());
    path = remaining.concat('*').join('/');

    e.give(path,[this,rest.slice()],this[lock]);
  }

}

PathEvent.prototype[define]({

  next: function(){
    return this[lock].give();
  },

  finally: function(){
    return this[lock].take();
  }

});

/*/ exports /*/

module.exports = PathEvent;
