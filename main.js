var remainingPath = Symbol(),
    emitter = Symbol();


function PathEvent(path,e){
  
  this[remainingPath] = path;
  this.rest = [];
  
  this[emitter] = e;
  
}

PathEvent.prototype.next = function(){
  var e = this[emitter],
      name,part;
  
  if(!this.rest.length){
    name = this[remainingPath];
    
    console.log(name);
    
    if(e.target.listeners(name)){
      e.give(name,this);
      return;
    }
    
    this[remainingPath] = name.split('/');
  }
  
  while(this[remainingPath].length > 1){
    this.rest.push(this[remainingPath].pop());
    name = this[remainingPath].concat('*').join('/');
    
    console.log(name);
    
    if(e.target.listeners(name)){
      e.give(name,this);
      return;
    }
    
  }
  
};

module.exports = PathEvent;
