/**/ 'use strict' /**/
var Lock = require('y-lock'),
    pct = require('pct'),

    common = Symbol();

// PathEvent

class PathEvent extends Lock{

  constructor(){
    super(0);
    this[common] = this;
    if(arguments.length) this.emit(...arguments);
  }

  emit(path,e,max,prefixes){
    var remaining,rest,prefix,args,joined;

    path = path.replace(/\*/g,'%2A');
    prefixes = prefixes || [];
    prefixes.push('');

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

  get common(){ return this[common]; }

  argv(n){
    if(n != null) return this.args.split('/',n).map(decode);
    return this.args.split('/').map(decode);
  }

}

// - utils

function decode(arg){
  return pct.decodeComponent(arg);
}

/*/ exports /*/

module.exports = PathEvent;
