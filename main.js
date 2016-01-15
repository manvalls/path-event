/**/ 'use strict' /**/
var Lock = require('y-lock'),
    define = require('u-proto/define'),

    lock = Symbol(),
    common = Symbol();

// PathEvent

function PathEvent(path,e,max){
  var remaining,rest;

  Lock.call(this,0);
  this[common] = this;

  if(max != null){
    remaining = path.split('/',max);
    rest = [path.replace(remaining.join('/') + '/','')];
  }else{
    remaining = path.split('/');
    rest = [];
  }

  e.give('*',Object.create(this,{
    args: {value: path}
  }));

  e.give(path,Object.create(this,{
    args: {value: ''}
  }));

  while(remaining.length > 0){
    path = remaining.concat('*').join('/');
    e.give(path,Object.create(this,{
      args: {value: rest.join('/')}
    }));

    rest.unshift(remaining.pop());
  }

}

PathEvent.prototype = Object.create(Lock.prototype);
PathEvent.prototype[define]('constructor',PathEvent);
PathEvent.prototype[define]({

  get common(){ return this[common]; },

  argv: function(n){
    if(n != null) return this.args.split('/',n);
    return this.args.split('/');
  }

});

/*/ exports /*/

module.exports = PathEvent;
