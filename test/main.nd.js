var t = require('u-test'),
    assert = require('assert'),
    Emitter = require('y-emitter'),
    PathEvent = require('../main.js');

t('Top event',function(){
  var emitter = new Emitter(),
      target = emitter.target,
      n = 0,
      last;

  target.on('/*',function(e){
    n++;
    last = e;
  });

  assert.strictEqual(n,0);

  new PathEvent('/foo/bar',emitter);
  assert.strictEqual(n,1);
  assert.strictEqual(last.args,'foo/bar');
  assert.deepEqual(last.argv(),['foo','bar']);
  assert.deepEqual(last.argv(1),['foo']);

  new PathEvent('/*',emitter);
  assert.strictEqual(n,2);
  assert.strictEqual(last.args,'%2A');
  assert.deepEqual(last.argv(),['*']);
  assert.deepEqual(last.argv(1),['*']);
});

t('Full event',function*(){
  var emitter = new Emitter(),
      target = emitter.target,
      yd,e;

  yd = target.until('/foo/$/?');
  setTimeout(() => new PathEvent('/foo/bar',emitter));
  e = yield yd;
  assert.strictEqual(e.args,null);

  yd = target.until('e/404');
  setTimeout(() => new PathEvent('e/404',emitter));
  e = yield yd;
  assert.strictEqual(e.args,null);
});

t('Event flow',function(){
  var emitter = new Emitter(),
      target = emitter.target,
      e;

  target.on('/?',function*(e){
    yield e.capture();
    assert.strictEqual(e.args,'lorem/ipsum/dolor/sit');
    assert.strictEqual(e.step,undefined);
    e.common.step = 1;
    e.next();
  });

  target.on('/lorem/ipsum/dolor/sit/*',function*(e){
    yield e.take(); // this should never happen
  });

  target.on('/lorem/$/dolor/sit',function*(e){
    yield e.take();
    assert.strictEqual(e.args,null);
    assert.strictEqual(e.step,1);
    assert.strictEqual(e.params.lorem, 'ipsum');
    e.common.step = 2;
    e.give();
  });

  target.on('/lorem/$/dolor/sit/?',function*(e){
    yield e.take();
    assert.strictEqual(e.args,null);
    assert.strictEqual(e.step,2);
    assert.strictEqual(e.params.lorem, 'ipsum');
    e.common.step = 3;
    e.give();
  });

  target.on('/lorem/ipsum/dolor/*',function*(e){
    yield e.take();
    assert.strictEqual(e.args,'sit');
    assert.strictEqual(e.step,3);
    e.common.step = 4;
    e.give();
  });

  target.on('/lorem/ipsum/*',function*(e){
    yield e.take();
    assert.strictEqual(e.args,'dolor/sit');
    assert.strictEqual(e.step,4);
    e.common.step = 5;
    e.give();
  });

  target.on('/lorem/*',function*(e){
    yield e.take();
    assert.strictEqual(e.args,'ipsum/dolor/sit');
    assert.strictEqual(e.step,5);
    e.common.step = 6;
    e.give();
  });

  target.on('/*',function*(e){
    yield e.take();
    assert.strictEqual(e.args,'lorem/ipsum/dolor/sit');
    assert.strictEqual(e.step,6);
    e.common.step = 7;
    e.give();
  });

  e = new PathEvent('/lorem/ipsum/dolor/sit',emitter);
  e.give();
  assert.strictEqual(e.step,7);

  e = new PathEvent('/lorem/ipsum/dolor/sit',emitter);
  e.give();
  assert.strictEqual(e.step,7);

});

t('Event flow with rest',function(){
  var emitter = new Emitter(),
      target = emitter.target,
      e;

  target.on('/*',function*(e){
    yield e.capture();
    assert.strictEqual(e.args,'lorem/ipsum/dolor/sit/amet');
    assert.strictEqual(e.step,undefined);
    e.common.step = 1;
    e.give();
  });

  target.on('/lorem/ipsum/dolor/*',function*(e){
    yield e.take();
    assert.strictEqual(e.args,'sit/amet');
    assert.strictEqual(e.step,1);
    e.common.step = 2;
    e.give();
  });

  target.on('/lorem/ipsum/*',function*(e){
    yield e.take();
    assert.strictEqual(e.args,'dolor/sit/amet');
    assert.strictEqual(e.step,2);
    e.common.step = 3;
    e.give();
  });

  target.on('/lorem/*',function*(e){
    yield e.take();
    assert.strictEqual(e.args,'ipsum/dolor/sit/amet');
    assert.strictEqual(e.step,3);
    e.common.step = 4;
    e.give();
  });

  target.on('/*',function*(e){
    yield e.take();
    assert.strictEqual(e.args,'lorem/ipsum/dolor/sit/amet');
    assert.strictEqual(e.step,4);
    e.common.step = 5;
    e.give();
  });

  e = new PathEvent('/lorem/ipsum/dolor/sit/amet',emitter);
  e.give();
  assert.strictEqual(e.step,5);

  e = new PathEvent('/lorem/ipsum/dolor/sit/amet',emitter);
  e.give();
  assert.strictEqual(e.step,5);

});
