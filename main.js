var Lock = require('y-lock'),
    define = require('u-proto/define'),
    defer = require('y-resolver').defer,

    lock = Symbol(),
    argument = Symbol();

// PathEvent

function PathEvent(path,e,max){
  var lk = this[lock] = new Lock(0),
      remaining,rest;

  if(path == '*') path = '/*';
  remaining = path.split('/');

  e.give('*',new Arg([this,remaining.slice(),path],lk));
  if(path.slice(-2) != '/*') e.give(path,new Arg([this,[],''],lk));

  if(max != null && remaining.length > ++max){
    rest = remaining.slice(max);
    remaining = remaining.slice(0,max);
  }else rest = [];

  while(remaining.length > 1){
    rest.unshift(remaining.pop());
    path = remaining.concat('*').join('/');

    e.give(path,new Arg([this,rest.slice(),rest.join('/')],lk));
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

// Arg

function Arg(arg,lk){
  this[argument] = arg;
  this[lock] = lk;
}

Arg.prototype[define](defer,function(){
  return this[lock].take(this[argument]);
});

/*/ exports /*/

module.exports = PathEvent;
