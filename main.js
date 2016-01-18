/**/ 'use strict' /**/
var Lock = require('y-lock'),
    define = require('u-proto/define'),
    pct = require('pct'),

    lock = Symbol(),
    common = Symbol();

// PathEvent

function PathEvent(path,e,max,prefixes){
  var remaining,rest,prefix,args;

  prefixes = prefixes || [];
  prefixes.push('');

  Lock.call(this,0);
  this[common] = this;

  if(max != null){
    remaining = path.split('/',max);
    rest = [path.replace(remaining.join('/') + '/','')];
  }else{
    remaining = path.split('/');
    rest = [];
  }

  for(prefix of prefixes) e.give(prefix + '*',Object.create(this,{
    args: {value: path}
  }));

  for(prefix of prefixes) e.give(prefix + path,Object.create(this,{
    args: {value: ''}
  }));

  while(remaining.length > 0){
    path = remaining.concat('*').join('/');
    args = rest.join('/');

    for(prefix of prefixes) e.give(prefix + path,Object.create(this,{
      args: {value: args}
    }));

    rest.unshift(remaining.pop());
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
