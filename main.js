var Lock = require('y-lock'),
    define = require('u-proto/define'),
    walk = require('y-walk'),

    lock = Symbol(),

    handle;

function PathEvent(path,e,max){
  this[lock] = new Lock(0);
  handle(this,this[lock],path,e,max);
}

PathEvent.prototype[define]({

  next: function(){
    return this[lock].give();
  },

  finally: function(){
    return this[lock].take();
  }

});

handle = walk.wrap(function*(pe,lock,path,e,max){
  var remaining = path.split('/'),
      rest;

  e.give('*',[pe,remaining.slice(1)],lock);
  e.give(path,[pe,[]],lock);

  if(max != null && remaining.length > max){
    rest = remaining.slice(max);
    remaining = remaining.slice(0,max);
  }else rest = [];

  while(remaining.length > 1){
    rest.unshift(remaining.pop());
    path = remaining.concat('*').join('/');

    e.give(path,[pe,rest.slice()],lock);
  }

});

/*/ exports /*/

module.exports = PathEvent;
