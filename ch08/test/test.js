const { equal } = require('assert');
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

describe('8.2', () => {
  describe('Promise', () => {
    it('should be able to assert using return', () => {
      const f = x => Promise.resolve(x + 1);
      return f(1).then(
        result => assert.equal(result, 2));
    }),
    it('should be able to assert using done', done => {
      const f = x => Promise.resolve(x + 1);
      f(1).then(
        result => {
          assert.equal(result, 2);
          done();
        });
    }),
    it('should be able to assert using async', async () => {
      const f = x => Promise.resolve(x + 1);
      const result = await f(1);
      assert.equal(result, 2);
    });
  });
});