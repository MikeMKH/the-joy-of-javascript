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
    }),
    it('should be chainable', () => {
      const result = Promise.resolve(42)
        .then(x => x**2)
        .then(x => x * 3)
        .then(x => x + 7);
      return Promise.all([result]).then(
        results => assert.deepEqual(results[0], 42**2 * 3 + 7));
    }),
    it('should be able to nestable', () => {
      const unique = letters => Array.from(new Set([...letters]))
      const join = arr => Array.from(arr).join('');
      const toUpperCase = str => str.toUpperCase();
      const concat = arr1 => arr2 => arr1.concat(arr2);
      
      const result = Promise.resolve('aabbcc')
        .then(unique)
        .then(abc =>
          Promise.resolve('ddeeff')
            .then(unique)
            .then(def => abc.concat(def))
        )
        .then(join)
        .then(toUpperCase);
      return Promise.all([result]).then(
        results => assert.deepEqual(results[0], 'ABCDEF'));
    }),
    it('should catch errors', () => {
      let wasCalled = {
        then: false,
        catch: false
      };
      const result = Promise.resolve(42)
        .then(() => { throw new Error('oops') })
        .then(x => { wasCalled.then = true; return x })
        .catch(() => { wasCalled.catch = true; return 'caught' });
      return Promise.all([result]).then(
        results => {
          assert.deepEqual(results[0], 'caught');
          assert.deepEqual(wasCalled, {
            then: false,
            catch: true
          });
        });
    })
  });
});