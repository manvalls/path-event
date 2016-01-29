/**/ 'use strict' /**/
var Lock = require('y-lock'),
    define = require('u-proto/define'),
    pct = require('pct'),

    lock = Symbol(),
    common = Symbol();

// PathEvent

function PathEvent(path,e,max,prefixes){
  var remaining,rest,prefix,args,joined;

  prefixes = prefixes || [];
  prefixes.push('');

  Lock.call(this,0);
  this[common] = this;

  for(prefix of prefixes) e.give(prefix + path,Object.create(this,{
    args: {value: ''}
  }));

  if(max != null){

    if(!max){
      remaining = [];
      rest = [path];
    }else{
      remaining = path.split('/',max + 1);
      joined = remaining.join('/');

      if(joined == path) rest = [];
      else rest = [path.replace(joined + '/','')];
    }

  }else{
    remaining = path.split('/');
    rest = [];
  }

  while(remaining.length > 1){
    rest.unshift(remaining.pop());
    path = remaining.concat('*').join('/');
    args = rest.join('/');

    for(prefix of prefixes) e.give(prefix + path,Object.create(this,{
      args: {value: args}
    }));

  }

}

PathEvent.prototype = Object.create(Lock.prototype);
PathEvent.prototype[define]('constructor',PathEvent);
PathEvent.prototype[define]({

  get common(){ return this[common]; },

  argv: function(n){
    if(n != null) return this.args.split('/',n).map(decode);
    return this.args.split('/').map(decode);
  }

});

// - utils

function decode(arg){
  return pct.decodeComponent(arg);
}

/*/ exports /*/

module.exports = PathEvent;
