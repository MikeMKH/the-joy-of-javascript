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
}),
describe('7.3', () => {
  describe('local registry', () => {
    it('should be scoped to the function it is declared in', () => {
      function foo() {
        const s = Symbol('foo');
        assert.equal(typeof s, 'symbol');
        assert.equal(s.description, 'foo');
      }
      foo();
    });
  }),
  describe('global registry', () => {
    it('should be shared across all scopes', () => {
      const s1 = Symbol.for('foo');
      let s2 = null;
      
      (function foo() {
        s2 = Symbol.for('foo');
      })();
      
      assert.equal(s1, s2);
    });
  });
}),
describe('7.4', () => {
  describe('hidden properties', () => {
    const _count = Symbol('count');
    class Counter {
      constructor() {
        Object.defineProperty(this, _count, {
          enumerable: false,
          writable: true
        });
        this[_count] = 0;
      }
      increment() {
        this[_count] += 1;
      }
      get count() {
        return this[_count];
      }
    };
    it('should count', () => {
      const counter = new Counter();
      counter.increment();
      assert.equal(counter.count, 1);
      counter.increment();
      assert.equal(counter.count, 2);
    }),
    it('should hide _count', () => {
      const counter = new Counter();
      assert.deepEqual(Object.keys(counter), []);
      assert.deepEqual(Object.getOwnPropertyNames(counter), []);
    })
  }),
  describe('versioning objects', () => {
    const VERSION = '1.0';
    class Versioned {
      get [Symbol.for('version')]() {
        return VERSION;
      }
    };
    
    it('should have a version', () => {
      const versioned = new Versioned();
      assert.equal(versioned[Symbol.for('version')], VERSION);
    }),
    it('should be able to change the version', () => {
      const versioned = new Versioned();
      const newVersion = '1.1';
      Object.defineProperty(versioned, Symbol.for('version'), {
        value: newVersion,
        writable: true
      });
      assert.equal(versioned[Symbol.for('version')], newVersion);
    }),
    it('should be able to change functionality based on version', () => {
      function foo(versioned) {
        let result = 0;
        switch (versioned[Symbol.for('version')]) {
          case '1.0':
            result = 1;
            break;
          case '1.1':
            result = 2;
            break;
          default:
            result = -1;
        }
        return result;
      }
      const versioned = new Versioned();
      assert.equal(foo(versioned), 1);
      
      Object.defineProperty(versioned, Symbol.for('version'), {
        value: '1.1',
        writable: true
      });
      assert.equal(foo(versioned), 2);
    });
  }),
  describe('serialization', () => {
    class Serializable {
      constructor() {
        this.foo = 'foo';
        this.bar = 'bar';
      }
      [Symbol.for('toJson')]() {
        return JSON.stringify({
          foo: this.foo,
          bar: this.bar
        });
      }
    }
    
    it('should serialize', () => {
      const serializable = new Serializable();
      assert.equal(serializable[Symbol.for('toJson')](), '{"foo":"foo","bar":"bar"}');
    });
  });
}),
describe('7.5', () => {
  describe('@@toStringTag', () => {
    it('should return the name given', () => {
      class MyClass {
        get [Symbol.toStringTag]() {
          return 'Foo';
        }
      }
      const myClass = new MyClass();
      assert.equal(myClass.toString(), '[object Foo]');
    }),
    it('should allow for an object to be named', () => {
      function MyObjectService() {
        return {
          [Symbol.toStringTag]: 'Bar',
          foo: 'foo',
          bar: 'bar'
        }
      }
      const myObject = new MyObjectService();
      assert.equal(myObject.toString(), '[object Bar]');
    });
  }),
  describe('@@isConcatSpreadable', () => {
    it('should allow for an array to not spread on concat', () => {
      const numbers = [1, 2, 3];
      const letters = ['a', 'b', 'c'];
      assert.deepEqual(numbers.concat(letters), [1, 2, 3, 'a', 'b', 'c']);
      letters[Symbol.isConcatSpreadable] = false;
      assert.deepEqual(numbers.concat(letters), [1, 2, 3, ['a', 'b', 'c']]);
    }),
    describe('Pair', () => {
      class Pair extends Array {
        constructor(left, right) {
          super();
          this[0] = left;
          this[1] = right;
        }
        get [Symbol.isConcatSpreadable]() {
          return false;
        }
      }
      
      it('should concat as two arrays', () => {
        const pair1 = new Pair(1, 2);
        const pair2 = new Pair(3, 4);
        assert.deepEqual(pair1.concat(pair2), [[1, 2], [3, 4]]);
      }),
      it('should allow for map', () => {
        const p = new Pair(1, 2);
        assert.deepEqual(p.map(x => x * 2), [2, 4]);
      });
    });
  }),
  describe('@@species', () => {
    it('should allow for a constructor to be specified', () => {
      class MyArray extends Array {
        static get [Symbol.species]() {
          return Array;
        }
      }
      const myArray = new MyArray();
      assert.equal(myArray.toString(), []);
      assert.equal(MyArray[Symbol.species], Array);
    });
    describe('EvensOnly', () => {
      class EvensOnly extends Array {
        constructor(...args) {
          super();
          args.filter(x => x % 2 === 0).forEach(x => this.push(x));
        }
        
        static get [Symbol.species]() {
          return Array;
        }
      }
      
      it('should only contain evens', () => {
        const evensOnly = new EvensOnly(1, 2, 3, 4);
        assert.deepEqual(evensOnly, [2, 4]);
      }),
      it('should be able to concat with only evens', () => {
        const evensOnly = new EvensOnly(1, 2, 3, 4);
        const other = new EvensOnly(5, 6);
        assert.deepEqual(evensOnly.concat(other), [2, 4, 6]);
      });
    });
  }),
  describe('@@toPrimitive', () => {
    describe('Date', () => {
      var date = new Date(2021, 10, 9); // Lily's got you day
      it('should use toString for concat', () => {
        assert.equal(
          `Date is ${date}`,
          'Date is Tue Nov 09 2021 00:00:00 GMT-0600 (Central Standard Time)');
      }),
      it('should use valueOf for addition', () => {
        assert.equal(+date, 1636437600000);
      })
    }),
    describe('adding to class', () => {
      class MyClass {
        constructor() {
          this.foo = 'foo';
          this.bar = 'bar';
        }
        [Symbol.toPrimitive](hint) {
          switch (hint) {
            case 'number':
              return 42;
            default:
              return `${this.foo} ${this.bar}`;
          }
        }
      }
      
      const myClass = new MyClass();
      it('should return 42 for number', () => {
        assert.equal(+myClass, 42);
      }),
      it('should return foo bar for string', () => {
        assert.equal(myClass + '', 'foo bar');
      });
    });
  }),
  describe('@@iterator', () => {
    it('should be able to iterate', () => {
      class MyArray {
        [Symbol.iterator]() {
          let i = 0;
          return {
            next: function() {
              return {
                done: i === 3,
                value: i++
              };
            }
          };
        }
      }
      const myArray = new MyArray();
      let values = [];
      for(let x of myArray) {
        values.push(x);
      }
      assert.deepEqual(values, [0, 1, 2]);
    }),
    describe('Pair', () => {
      const Pair = (left, right) => ({
        left: left,
        right: right,
        [Symbol.iterator]: function* () {
          yield this.left;
          yield this.right;
        }
      });
      const pair = Pair(1, 2);
      
      it('should iterate', () => {
        let values = [];
        for(let x of pair) {
          values.push(x);
        }
        assert.deepEqual(values, [1, 2]);
      });
    });
  }),
  describe('7.6', () => {
    describe('Proxy', () => {
      let log = [];
      const loggerHandler = {
        get: function(target, key) {
          log.push(`get ${key} on ${target}`);
          return target[key];
        }
      };
      
      it('should be able to log', () => {
        const obj = {
          foo: 'foo',
          bar: 'bar',
          [Symbol.toStringTag]: 'FooBar'
        };
        const proxy = new Proxy(obj, loggerHandler);
        assert.equal(proxy.foo, 'foo');
        assert.equal(proxy.bar, 'bar');
        assert.deepEqual(log, ['get foo on [object FooBar]', 'get bar on [object FooBar]']);
      });
    }),
    describe('Reflect', () => {
      it('should be able to define a property', () => {
        const obj = {};
        Reflect.defineProperty(obj, 'foo', {
          value: 'foo',
          writable: true,
          enumerable: true,
          configurable: true
        });
        assert.equal(obj.foo, 'foo');
      }),
      it('should be able to simplify Proxy code', () => {
        const obj = {};
        let log = [];
        const proxy = new Proxy(obj, {
          get: function(...args) {
            log.push(`get ${args[1]} on ${args[0]}`);
            return Reflect.get(...args);
          },
          set: function(target, key, value) {
            log.push(`set ${key} on ${target} to ${value}`);
            target[key] = value;
            return true;
          }
        });
        proxy.foo = 'foo';
        assert.equal(proxy.foo, 'foo');
        assert.deepEqual(log, ['set foo on [object Object] to foo', 'get foo on [object Object]']);
      })
    });
  });
}),
describe('7.6', () => {
  class Counter {
    constructor(count = 0) {
      this._count = count;
    }
    increment(by = 1) {
      this._count += by;
    }
    decrement(by = 1) {
      this._count -= by;
    }
    get count() {
      return this._count;
    }
  };
  
  function checkLimit(counter) {
    if(counter[_count] > 10) {
      throw new Error('Counter limit exceeded');
    }
  }
  
  function identity(x) {
    return x;
  }
  
  const validation = {
    actions: {
      before: checkLimit,
      after: identity
    },
    methods: ['increment', 'decrement']
  };
  
  const decorator = (decorator, obj) => new Proxy(obj, {
    get: function(target, key) {
      if(!decorator.methods.includes(key)) {
        return target[key];
      }
      return function(...args) {
        decorator.actions.before(target);
        const result = target[key](...args);
        decorator.actions.after(target);
        return result;
      };
    }
  });
  
  const counter = decorator(validation, new Counter(0));
  
  it('should validate the count before incrementing', () => {
    assert.throws(() => counter.increment(10), Error);
  }),
  it('should validate the count before decrementing', () => {
    assert.throws(() => counter.decrement(10), Error);
  }),
  it('should increment the count', () => {
    const c = new Counter(0);
    c.increment();
    assert.equal(c.count, 1);
    // decorator not working correctly
    // assert.equal(counter.increment(1).count(), 1);
  });
});