var assert = require('assert');

var PositiveNegativeCounter = require('../lib/PositiveNegativeCounter');

describe('PositiveNegativeCounter', function() {
  beforeEach(function() {
    counter1 = new PositiveNegativeCounter('a');
    counter2 = new PositiveNegativeCounter('b');
  });

  it('should increment single', function () {
    counter1.increment(2);
    assert.equal(counter1.getValue(), 2);

    counter1.increment(3);
    assert.equal(counter1.getValue(), 5);
  });

  it('should merge correctly', function () {
    counter1.increment(3);
    counter2.increment(4);

    counter1.merge([counter2.getState()]);
    assert.equal(counter1.getValue(), 7);

    counter2.merge([counter1.getState()]);
    assert.equal(counter2.getValue(), 7);

    counter2.decrement(2);

    counter1.merge([counter2.getState()]);
    assert.equal(counter1.getValue(), 5);

    counter1.decrement(2);
    counter1.decrement(1);
    counter2.merge([counter1.getState()]);

    assert.equal(counter2.getValue(), 2);
    assert.equal(counter1.getValue(), 2);
  });
});
