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
      });
    });
  });
}),
describe('9.2', () => {
  describe('generators', () => {
    it('should be of type Object [Generator]', () => {
      const generator = function* () {
        return "hello";
      };
      
      assert.equal(typeof generator(), 'object');
      assert.equal(typeof generator, 'function');
      assert.equal(generator.constructor.name, 'GeneratorFunction');
    }),
    it('should be iterable', () => {
      const generator = function* () {
        yield 1;
        yield 2;
        yield 3;
      };
      
      assert.deepEqual([generator().next()], [{value: 1, done: false}]);
      assert.deepEqual([...generator()], [1, 2, 3]);
    }),
    it('should implement the iterator protocol', () => {
      const f = function* () {
        yield "hello";
        yield "Lily";
      };
      
      const it = f();
      assert.deepEqual(it.next(), {value: "hello", done: false});
      assert.deepEqual(it.next(), {value: "Lily", done: false});
    });
  }),
  describe('async generators', () => {
    it('should be of type Object [AsyncGenerator]', () => {
      const asyncGenerator = async function* () {
        return "hello";
      };
      
      assert.equal(typeof asyncGenerator(), 'object');
      assert.equal(typeof asyncGenerator, 'function');
      assert.equal(asyncGenerator.constructor.name, 'AsyncGeneratorFunction');
    }),
    it('should be iterable', async () => {
      const asyncGenerator = async function* () {
        yield 1;
        yield 2;
        yield 3;
      };
      
      const result = [];
      for await(const value of asyncGenerator()) {
        result.push(value);
      }
      assert.deepEqual(result, [1, 2, 3]);
    }),
    it('should implement the iterator protocol', async () => {
      const f = async function* () {
        yield "hello";
        yield "Lily";
      };
      
      const it = f();
      assert.deepEqual(await it.next(), {value: "hello", done: false});
      assert.deepEqual(await it.next(), {value: "Lily", done: false});
    });
  });
})