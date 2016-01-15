var t = require('u-test'),
    assert = require('assert'),
    Emitter = require('y-emitter'),
    PathEvent = require('../main.js'),
    updateMax = require('../updateMax.js'),
    max = Symbol();

t('Top event',function(){
  var emitter = new Emitter(),
      target = emitter.target,
      n = 0,
      last;

  target.on('*',function(e){
    n++;
    last = e;
  });

  updateMax(target,max);
  assert.strictEqual(n,0);

  new PathEvent('/foo/bar',emitter,target[max]);
  assert.strictEqual(n,1);
  assert.strictEqual(last.args,'/foo/bar');
  assert.deepEqual(last.argv(),['','foo','bar']);
  assert.deepEqual(last.argv(2),['','foo']);

  new PathEvent('/*',emitter,target[max]);
  assert.strictEqual(n,2);
  assert.strictEqual(last.args,'/*');
  assert.deepEqual(last.argv(),['','*']);
  assert.deepEqual(last.argv(1),['']);
});

t('Full event',function*(){
  var emitter = new Emitter(),
      target = emitter.target,
      yd,e;

  updateMax(target,max);
  yd = target.until('/foo/bar');
  new PathEvent('/foo/bar',emitter,target[max]);
  e = yield yd;
  assert.strictEqual(e.args,'');

  updateMax(target,max);
  yd = target.until('e/404');
  new PathEvent('e/404',emitter,target[max]);
  e = yield yd;
  assert.strictEqual(e.args,'');
});

t('Event flow',function(){
  var emitter = new Emitter(),
      target = emitter.target,
      e;

  updateMax(target,max);

  target.on('*',function*(e){
    yield e.take();
    assert.strictEqual(e.args,'/lorem/ipsum/dolor/sit');
    assert.strictEqual(e.step,undefined);
    e.common.step = 1;
    e.give();
  });

  target.on('/lorem/ipsum/dolor/sit',function*(e){
    yield e.take();
    assert.strictEqual(e.args,'');
    assert.strictEqual(e.step,1);
    e.common.step = 2;
    e.give();
  });

  target.on('/lorem/ipsum/dolor/*',function*(e){
    yield e.take();
    assert.strictEqual(e.args,'sit');
    assert.strictEqual(e.step,2);
    e.common.step = 3;
    e.give();
  });

  target.on('/lorem/ipsum/*',function*(e){
    yield e.take();
    assert.strictEqual(e.args,'dolor/sit');
    assert.strictEqual(e.step,3);
    e.common.step = 4;
    e.give();
  });

  target.on('/lorem/*',function*(e){
    yield e.take();
    assert.strictEqual(e.args,'ipsum/dolor/sit');
    assert.strictEqual(e.step,4);
    e.common.step = 5;
    e.give();
  });

  target.on('/*',function*(e){
    yield e.take();
    assert.strictEqual(e.args,'lorem/ipsum/dolor/sit');
    assert.strictEqual(e.step,5);
    e.common.step = 6;
    e.give();
  });

  e = new PathEvent('/lorem/ipsum/dolor/sit',emitter,target[max]);
  e.give();
  assert.strictEqual(e.step,6);

  e = new PathEvent('/lorem/ipsum/dolor/sit',emitter);
  e.give();
  assert.strictEqual(e.step,6);

});
