var Lock = require('y-lock'),
    define = require('u-proto/define'),

    lock = Symbol();


function PathEvent(path,e,max){
  var rest,remaining;

  this[lock] = new Lock(0);
  e.give(path,[this,[]]);

  remaining = path.split('/');
  if(max != null && remaining.length > max){
    rest = remaining.slice(max);
    remaining = remaining.slice(0,max);
  }else rest = [];

  while(remaining.length > 1){
    rest.unshift(remaining.pop());
    path = remaining.concat('*').join('/');
    e.give(path,[this,rest.slice()]);
  }

  this[lock].give();
}

PathEvent.prototype[define]({

  handle: function(){
    return this[lock].take();
  },

  free: function(){
    return this[lock].give();
  }

});

/*/ exports /*/

module.exports = PathEvent;
