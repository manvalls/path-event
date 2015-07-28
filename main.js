var remainingPath = Symbol(),
    pathname = Symbol(),
    emitter = Symbol();


function PathEvent(path,e){
  this[pathname] = path;
  this[emitter] = e;

  this.rest = [];
}

PathEvent.prototype.next = function(){
  var e = this[emitter],
      name;

  if(!this[remainingPath]){

    name = this[pathname];
    this[remainingPath] = name.split('/');

    if(e.target.listeners(name)){
      e.give(name,this);
      return;
    }

  }

  while(this[remainingPath].length > 1){

    this.rest.unshift(this[remainingPath].pop());
    name = this[remainingPath].concat('*').join('/');

    if(e.target.listeners(name)){
      e.give(name,this);
      return;
    }

  }

};

PathEvent.prototype.prev = function(){
  var e = this[emitter],
      name;

  while(this.rest.length){
    this[remainingPath].push(this.rest.shift());
    name = this[remainingPath].concat('*').join('/');

    if(e.target.listeners(name)){
      e.give(name,this);
      return;
    }

  }

  if(this[remainingPath]){

    name = this[pathname];
    this[remainingPath] = null;

    if(e.target.listeners(name)){
      e.give(name,this);
      return;
    }

  }

};

module.exports = PathEvent;
