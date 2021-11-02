const assert = require('assert');

const compose2 = (f, g) => (...args) => f(g(...args));
const compose = (...fns) => fns.reduce(compose2);
const composeM2 = (f, g) => (...args) => g(...args).flatMap(f);
const composeM = (...Ms) => Ms.reduce(composeM2);
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

describe('9.1', () => {
  describe('iterator protocol', () => {
    describe('iterator example', () => {
      it('should return an iterator', () => {
        const values = [1, 2, 3];
        const iterator = values[Symbol.iterator](); // not well formed
        
        assert.equal(typeof iterator, 'object');
        assert.equal(iterator.next().value, 1);
        assert.equal(iterator.next().value, 2);
        assert.equal(iterator.next().value, 3);
        assert.equal(iterator.next().done, true);
      }),
      it('should support for of', () => {
        const iterator = "Lily"[Symbol.iterator]();
        
        const result = [];
        for (const value of iterator) {
          result.push(value);
        }
        assert.equal(result.join(""), "Lily");
      }),
      it('should support for of with map', () => {
        const iterator = {};
        iterator[Symbol.iterator] = function* () {
          yield 1;
          yield 2;
          yield 3;
        };
        
        assert.deepEqual([...iterator], [1, 2, 3]);
      })
    })
  })
})