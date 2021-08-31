var assert = require('assert');
const compose2 = (f, g) => (...args) => f(g(...args));
const compose = (...fns) => fns.reduce(compose2);
const curry = fn => (...args1) =>
  args1.length === fn.length
  ? fn(...args1)
  : (...args2) => {
      const args = [...args1, ...args2];
      return args.length >= fn.length
      ? fn(...args)
      : curry(fn)(...args);
};

describe('4.0', function() {
  it('functions are objects', function() {
    assert.ok(Function.prototype.__proto__.constructor === Object);
  });
});

describe('4.1', function() {
  describe('function are data', function() {
    it('should be useable as a constant', function() {
      const eight = () => 8;
      assert.equal(eight(), 8);
    }),
    it('should be useable as a variable', function() {
      const identity = x => x;
      
      const eight = identity(8);
      const nine = identity(9);
      
      assert.equal(eight, 8);
      assert.equal(nine, 9);
    }),
    it('should be useable as a factory', function() {
      const NameFactory = (first, last) => Object.create({
        get name() { return `${first} ${last}` },
        greet: function(person) { return `Hello ${person}. I am ${this.name}`; }
      });
      
      assert.equal(NameFactory('John', 'Doe').greet('Jane'), 'Hello Jane. I am John Doe');
      assert.equal(NameFactory('Matt', 'Skiba').name, 'Matt Skiba');
    });
  });
});

describe('4.2', function() {
  const numbers = [...Array(10).keys()];
  describe('imperative', function() {
    it('should be able to filter, map, and sum values', function() {
      let sum = 0;
      for(const number of numbers) {
        if(number % 2 === 0) {
          sum += (number * 3);
        }
      }
      assert.equal(sum, 60);
    });
  }),
  describe('functional', function() {
    it('should be able to filter, map, and sum values', function() {
      const sum = numbers
        .filter(x => x % 2 === 0)
        .map(x => x * 3)
        .reduce((m, x) => m + x);
      assert.equal(sum, 60);
    });
  });
});

describe('4.3', function() {
  describe('compose2', function() {
    it('should be able to compose functions', function() {
      const add1 = x => x + 1;
      const multiply2 = x => x * 2;
      const add1AndMultiply2 = compose2(add1, multiply2);
      assert.equal(add1AndMultiply2(3), (3 * 2) + 1);
    }),
    it('should be able to compose functions which use strings', function() {
      const count = arr => arr.length;
      const split = str => str.split(/\s+/);
      const countWords = compose2(count, split);
      assert.equal(countWords('hello world'), 2);
      assert.equal(countWords('the quick brown fox jump over the box'), 8);
    });
  }),
  describe('compose', function() {
    it('should be able to compose functions', function() {
      const add1 = x => x + 1;
      const multiply2 = x => x * 2;
      const multiply4 = compose2(multiply2, multiply2);
      const f = compose(multiply4, add1, multiply2);
      assert.equal(f(3), ((3 * 2) + 1) * 4);
    });
  });
  describe('HasHash', function() {
    const computeCipher = (data, i = 0, hash = 0) => {
      if(i >= data.length) {
        return hash ** 2;
      }
      return computeCipher(
        data,
        i + 1,
        ((hash << 5) - hash + data.charCodeAt(i)) << 0
      );
    };
    const assemble = keys => obj => keys.map(key => obj[key]).join(' ');
    
    describe('computeCipher', function() {
      it('should be able to compute a cipher', function() {
        assert.equal(computeCipher('hello world'), 3218816525823026700);
        assert.equal(computeCipher('John Doe'), 1869562306066055700);
        assert.equal(computeCipher('the quick brown fox jump over the box'), 258019758144341220);
        assert.equal(computeCipher('John Doe'), 1869562306066055700);
      });
    }),
    describe('assemble', function() {
      it('should be able to grab given key values from an object', function() {
        const getName = assemble(['first', 'last']);
        assert.deepEqual(getName({first: 'John', last: 'Doe', other: 42}), 'John Doe');
      });
    }),
    describe('computeHash', function() {
      it('should be able to compute a hash', function() {
        const computeHash = compose(computeCipher, assemble(['first', 'last']));
        assert.equal(computeHash({first: 'John', last: 'Doe', other: 'stuff'}), 1869562306066055700);
      });
    });
  });
});

describe('4.4', function() {
  describe('curry', function() {
    it('should be able to curry a function', function() {
      const add = (x, y) => x + y;
      const add1 = curry(add)(1);
      assert.equal(add1(2), 3);
    });
  }),
  describe('prop', function() {
    const prop = curry((key, obj) => obj[key]);
    it('should be able to get a property', function() {
      const getName = prop('name');
      assert.equal(getName({name: 'John Doe', something: 'else'}), 'John Doe');
    });
  });
});