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

describe('7.1', () => {
  it('eval', () => {
    let result = 0;
    const code = `
      const add = (x, y) => x + y;
      result = add(1, 2);
    `;
    eval(code);
    assert.equal(result, 3);
  }),
  it('property name', () => {
    const propName = 'foo';
    const identity = x => x;
    const obj = {
      bar: 10,
      [identity(propName)]: 20
    };
    assert.equal(obj.foo, 20);
  }),
  describe('metaprogramming', () => {
    const proto = {
      foo: 10,
      bar: function() { return 'hello'; },
      [Symbol('private')]: 'private data'      
    };
    
    const obj = Object.create(proto);
    obj.baz = 20;
    
    it('getOwnPropertyNames', () => {
      const names = Object.getOwnPropertyNames(obj);
      assert.deepEqual(names, ['baz']);
    }),
    it('getOwnPropertySymbols', () => {
      assert.deepEqual(
        Object.getOwnPropertySymbols(obj),
        []);
      assert.equal(
        Object.getOwnPropertySymbols(proto)[0].toString(),
        Symbol('private').toString());
    }),
    it('getOwnPropertyDescriptor', () => {
      const desc = Object.getOwnPropertyDescriptor(obj, 'baz');
      assert.deepEqual(desc, {
        value: 20,
        writable: true,
        enumerable: true,
        configurable: true
      });
    }),
    it('getPrototypeOf', () => {
      assert.equal(Object.getPrototypeOf(obj), proto);
    });
  })
}),
describe('7.2', () => {
  describe('Symbol', () => {
    it('should not have Symbol equal each other', () => {
      const s1 = Symbol();
      const s2 = Symbol();
      assert.notEqual(s1, s2);
    }),
    it('should have descriptions equal to each other', () => {
      const s1 = Symbol('foo');
      const s2 = Symbol('foo');
      assert.equal(s1.description, s2.description);
    }),
    it('should be usable as property keys', () => {
      const obj = {};
      const s = Symbol('value');
      obj[s] = 10;
      assert.equal(obj[s], 10);
    });
  });
})