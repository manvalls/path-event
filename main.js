var Lock = require('y-lock'),
    pct = require('pct'),

    listened = Symbol(),
    common = Symbol(),
    eventMap = Symbol();

class PathEvent extends Lock{

  constructor(){
    super(0);
    this[common] = this;
    if(arguments.length) this.emit(...arguments);
  }

  emit(path,e,prefixes){
    var map, event, events, prefix, name, keys, key, params;

    if(!e[eventMap]){
      e[eventMap] = Object.create(null);
      e.target.on(e.target.eventListened, addEvent, e[eventMap]);
      e.target.on(e.target.eventIgnored, removeEvent, e[eventMap]);
      for(event of e.target.events()) addEvent(event, null, e[eventMap]);
    }

    map = e[eventMap];
    events = [];

    path = path.replace(/\*/g,'%2A').replace(/\$/g,'%24').replace(/\?/g,'%3F');
    for(let prefix of (prefixes || [])) fillEvents(prefix.replace(/\//g,'%2F') + path, map, events);
    fillEvents(path, map, events);
    events.sort(sortEvents);

    for(event of events){
      params = {};
      name = event.parts.join('/');

      for(key of Object.keys(event.params)){
        params[key] = event.params[key].length == 1 ? event.params[key][0] : event.params[key];
      }

      e.give(name, Object.create(this, {
        args: {value: event.args},
        params: {value: params}
      }));
    }

  }

  argv(n){
    if(this.args == null) return [];
    if(n != null) return this.args.split('/',n).map(decode);
    return this.args.split('/').map(decode);
  }

  get common(){
    return this[common];
  }

}

// - utils

function addEvent(event, d, map){
  var parts, part;

  if(typeof event != 'string') return;
  parts = event.split('/');

  while((part = parts.shift()) != null){
    map[part] = map[part] || Object.create(null);
    map = map[part];
  }

  map[listened] = true;
}

function removeEvent(event, d, map){
  var part, rest;

  if(typeof event != 'string') return;
  [part] = event.split('/', 1);

  if(!map[part]) return;

  if(part.length == event.length) delete map[part][listened];
  else removeEvent(event.slice(part.length + 1), null, map[part]);
  if(!(map[part][listened] || Object.keys(map[part]).length)) delete map[part];

}

function fillEvents(event, map, events, item){
  var part, key, it, i;

  if(typeof event != 'string') return [];
  [part] = event.split('/', 1);

  if(map[part]){
    it = cloneItem(item);
    it.parts.push(part);

    if(part.length == event.length){

      if(map[part][listened]) events.push(it);
      if(map[part]['?'] && map[part]['?'][listened]){
        it = cloneItem(it);
        it.parts.push('?');
        events.push(it);
      }

    }else fillEvents(event.slice(part.length + 1), map[part], events, it);
  }

  if(map.$){
    it = cloneItem(item);

    for(i = it.parts.length - 1;i >= 1;i--) if(it.parts[i] != '$'){
      key = it.parts[i];
      break;
    }

    if(key == null) key = '$';

    it.parts.push('$');
    it.params[key] = it.params[key] || [];
    it.params[key].push(part);

    if(part.length == event.length){

      if(map.$[listened]) events.push(it);
      if(map.$['?'] && map.$['?'][listened]){
        it = cloneItem(it);
        it.parts.push('?');
        events.push(it);
      }

    }else fillEvents(event.slice(part.length + 1), map.$, events, it);
  }

  if(map['?'] && map['?'][listened]){
    it = cloneItem(item);
    it.parts.push('?');
    it.args = event;
    events.push(it);
  }

  if(map['*'] && map['*'][listened]){
    it = cloneItem(item);
    it.parts.push('*');
    it.args = event;
    events.push(it);
  }

}

function cloneItem(item){
  var params = {},
      key;

  if(!item) return getItem();

  for(key of Object.keys(item.params)) params[key] = item.params[key].slice();

  return {
    parts: item.parts.slice(),
    params: params,
    args: null
  };
}

function getItem(){
  return {
    parts: [],
    params: {},
    args: null
  };
}

function sortEvents(e1, e2){
  var s1 = special(e1),
      s2 = special(e2);

  if(s1 && !s2) return 1;
  if(!s1 && s2) return -1;
  return e2.parts.length - e1.parts.length;
}

function special(e){

  switch(e.parts[e.parts.length - 1]){
    case '*':
    case '?':
      return true;
    default:
      return false;
  }

}

function decode(arg){
  return pct.decodeComponent(arg);
}

/*/ exports /*/

module.exports = PathEvent;
