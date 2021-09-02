const { equal } = require('assert');
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

describe('4.5', function () {
  describe('Money', function() {
    const Money = curry((currency, amount) =>
      compose(
        Object.seal,
        Object.freeze,
      )(Object.assign(Object.create(null), {
        amount,
        currency,
        equals: other => other.currency === currency && other.amount === amount,
        toString: () => `${amount} ${currency}`,
        valueOf: () => amount,
        compareTo: other => amount - other.amount,
        round: (precision = 2) => Money(currency, precisionRound(amount, precision)),
        plus: other => Money(currency, amount + other.amount),
        minus: other => Money(currency, amount - other.amount),
        times: other => Money(currency, amount * other.amount),
        asNegative: () => Money(currency, -amount)
    })));
    
    Money.zero = (currency = 'USD') => Money(currency, 0);
    Money.sum = (...money) => money.reduce((m1, m2) => m1.plus(m2));
    Money.subtract = (...money) => money.reduce((m1, m2) => m1.minus(m2));
    Money.multiply = (...money) => money.reduce((m1, m2) => m1.times(m2));
    
    function precisionRound(number, precision) {
      const factor = Math.pow(10, precision);
      return Math.round(number * factor) / factor;
    };
    
    it('should be summable', function() {
      const sum = Money.sum(Money.zero(), Money('USD', 1), Money('USD', 2));
      assert.equal(sum.toString(), '3 USD');
    }),
    it('should be subtractable', function() {
      const difference = Money.subtract(Money('USD', 1), Money('USD', 2));
      assert.equal(difference.toString(), '-1 USD');
    }),
    it('should be multipliable', function() {
      const product = Money.multiply(Money('USD', 1), Money('USD', 2));
      assert.equal(product.toString(), '2 USD');
    }),
    it('should be able to be rounded', function() {
      const rounded = Money('USD', 1.234).round();
      assert.equal(rounded.toString(), '1.23 USD');
      
      assert.equal(Money('USD', 1.234).round(0).toString(), '1 USD');
    }),
    it('should be able to be compared', function() {
      const oneDollar = Money('USD', 1);
      const twoDollars = Money('USD', 2);
      assert.equal(oneDollar.compareTo(twoDollars), -1);
      assert.equal(twoDollars.compareTo(oneDollar), 1);
      assert.equal(oneDollar.compareTo(oneDollar), 0);
    }),
    it('should be able to be negated', function() {
      const negative = Money('USD', 1).asNegative();
      assert.equal(negative.toString(), '-1 USD');
    }),
    it('should be able to be added', function() {
      const sum = Money('USD', 1).plus(Money('USD', 2));
      assert.equal(sum.toString(), '3 USD');
    }),
    it('should be able to be subtracted', function() {
      const difference = Money('USD', 1).minus(Money('USD', 2));
      assert.equal(difference.toString(), '-1 USD');
    }),
    it('should be able to be multiplied', function() {
      const product = Money('USD', 1).times(Money('USD', 2));
      assert.equal(product.toString(), '2 USD');
    }),
    it('should be able to be compared to zero', function() {
      const zero = Money.zero();
      const one = Money('USD', 1);
      assert.equal(zero.compareTo(one), -1);
      assert.equal(one.compareTo(zero), 1);
      assert.equal(zero.compareTo(zero), 0);
    }),
    it('should be usable as a number', function() {
      const one = Money('USD', 1);
      const two = Money('USD', 2);
      assert.equal(one, 1);
      assert.equal(one + 2, 3);
      assert.equal(one * two, 2);
      assert.equal(two * two * 3.2, 12.8);
    }),
    it('should be usable as a string', function() {
      const one = Money('USD', 1);
      const two = Money('USD', 2);
      assert.equal(one.toString(), '1 USD');
      assert.equal(two.toString(), '2 USD');
    }),
    it('should be usable as a boolean', function() {
      const zero = Money.zero();
      const one = Money('USD', 1);
      assert.equal(zero, false);
      assert.equal(one, true);
    }),
    it('should be usable as an object', function() {
      const one = Money('USD', 1);
      assert.equal(one.amount, 1);
      assert.equal(one.currency, 'USD');
    }),
    it('should be usable as a map', function() {
      const one = Money('USD', 1);
      assert.equal(one['amount'], 1);
      assert.equal(one['currency'], 'USD');
    });
  });
});

describe('4.6', function() {
  describe('point-free', function() {
    const count = s => s.length;
    const split = curry((c, s) => s.split(c));
    
    it('should be able count words in a string', function() {
      const countWords = compose(
        count,
        split(' '),
      );
      
      assert.equal(countWords('Hello world'), 2);
    }),
    it('should be able count blocks in JSON', function() {
      const countWords = compose(
        count,
        JSON.parse
      );
      
      var arr = [1, 2, 3];
      assert.equal(countWords(JSON.stringify(arr)), 3);
    });
  });
});