
function updateMax(target,prop){
  target.on(target.eventListened,onEvChange,prop);
  target.on(target.eventIgnored,onEvChange,prop);
  onEvChange.call(target,null,null,prop);
}

function onEvChange(e,d,prop){
  var max = 1,
      event;

  for(event of this.events()) max = Math.max(max,
    event.split('/').length
  );

  this[prop] = max - 1;
}

/*/ exports /*/

module.exports = updateMax;
