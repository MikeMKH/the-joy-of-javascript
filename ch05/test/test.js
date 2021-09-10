const { equal } = require('assert');
var assert = require('assert');
const compose2 = (f, g) => (...args) => f(g(...args));
const compose = (...fns) => fns.reduce(compose2);
const pipe = (...fns) => fns.reduceRight(compose2);
const curry = fn => (...args1) =>
args1.length === fn.length
? fn(...args1)
: (...args2) => {
  const args = [...args1, ...args2];
  return args.length >= fn.length
  ? fn(...args)
  : curry(fn)(...args);
};
const filter = curry((f, a) => a.filter(f));
const map = curry((f, a) => a.map(f));
const reduce = curry((f, a) => a.reduce(f));

describe('5.1', function() {
  describe('applyIfNotNull', function() {
    const applyIfNotNull = curry((fn, data) =>
      (data != null)
      ? fn(data)
      : data);
      
    it('should apply function when value is not null', function() {
      const add1 = x => x + 1;
      const safeAdd1 = applyIfNotNull(add1);
      
      assert.equal(safeAdd1(1), 2);
      assert.equal(safeAdd1(101), 102);
    }),
    it('should not apply function when value is null', function() {
      let wasCalled = false;
      const spy = function() { wasCalled = true; }
      const sut = applyIfNotNull(spy);
      
      sut(null);
      assert.equal(wasCalled, false);
      sut(undefined);
      assert.equal(wasCalled, false);
    });
  }),
  describe('Array as a box', function() {
    it('should chain', function() {
      const unique = letters => Array.from(new Set(letters));
      const join = arr => arr.join('');
      const toUpper = str => str.toUpperCase();
      
      const result = Array.of('Mike Harris')
        .map(unique)
        .map(join)
        .map(toUpper)
        .pop();
      assert.equal(result, 'MIKE HARS');
    });
  }),
  describe('Id', function() {
    class Id extends Array {
      constructor(value) {
        super(1);
        this.fill(value);
      }
    }
    it('should chain', function() {
      const unique = letters => Array.from(new Set(letters));
      const join = arr => arr.join('');
      const toUpper = str => str.toUpperCase();
      
      const result = Id.of('Mike Harris')
        .map(unique)
        .map(join)
        .map(toUpper)
        .pop();
      assert.equal(result, 'MIKE HARS');
    });
  });
});

describe('5.2', function() {
  describe('flat', function() {
    it('should flatten an array', function() {
      assert.deepEqual(
        [['a', 'b'], ['c']].flat(),
        ['a', 'b', 'c']
      );
    }),
    it('should flatten an array to a given depth', function() {
      assert.deepEqual(
        [[[[1]]]].flat(2),
        [[1]]
      );
    }),
    it('should flatten a deep array', function() {
      assert.deepEqual(
        [[[[[[[[[['deep']]]]]]]]]].flat(Infinity),
        ['deep']
      );
    })
  }),
  describe('flatMap', function() {
    it('should flatten and apply map', function() {
      assert.deepEqual([[1], [2], [3]].flatMap(x => x * 2), [2, 4, 6]);
    }),
    it('should map and flatten function results', function() {
      assert.deepEqual(
        [1, 2, 3].flatMap(x => [x, x * 2]),
        [1, 2, 2, 4, 3, 6]
      );
    });
  });
})