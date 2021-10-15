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
    }),
    describe('#then', () => {
      it('should have an identity', () => {
        const identity = x => x;
        const x = Promise.resolve(1).then(identity);
        const y = Promise.resolve(1);
        return Promise.all([x, y]).then(
          results => assert.deepEqual(results, [1, 1]));
      }),
      it('should be composable', () => {
        const toUpperCase = x => x.toUpperCase();
        const exclaim = x => x + '!';
        const x = Promise.resolve('lily harris').then(toUpperCase).then(exclaim);
        const y = Promise.resolve('lily harris').then(compose(exclaim, toUpperCase));
        return Promise.all([x, y]).then(
          results => assert.deepEqual(results, ['LILY HARRIS!', 'LILY HARRIS!']));
      }),
      it('should be act as flatMap', () => {
        const exclaim = x => Promise.resolve(x + '!');
        const x = Promise.resolve('Lily').then(exclaim);
        const y = exclaim('Lily');
        return Promise.all([x, y]).then(
          results => assert.deepEqual(results, ['Lily!', 'Lily!']));
      })
    })
  });
});