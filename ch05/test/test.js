const { equal } = require('assert');
var assert = require('assert');
const { get } = require('http');
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

Function.prototype.map = function (f) {
  return compose(f, this);
};

const Functor = {
  map: function(f = identity) {
    return this.constructor.of(f(this.get()));
  }    
};

const Monad = Object.assign({}, Functor, {
  flatMap: function(f = identity) {
    return this.map(f).get();
  },
  chain: function(f = identity) {
    return this.flatMap(f);
  },
  bind: function(f = identity) {
    return this.flatMap(f);
  }
});

const NoopFunctor = {
  map(f) { return this; }
};

const NoopMonad = {
  flatMap(f) { return this; },
  chain(f) { return this; },
  bind(f) { return this; }
};

const identity = x => x;
const unique = letters => Array.from(new Set(letters));
const join = arr => arr.join('');
const toUpper = str => str.toUpperCase();

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
});

describe('5.3', function() {
  describe('map / compose correspondence', function() {
    it('should produce the same result', function() {
      const m = unique.map(join).map(toUpper);
      const c = compose(toUpper, join, unique);
      
      assert.deepEqual(m('Mike Harris'), c('Mike Harris'));
      assert.deepEqual(m('aabbccdd'), c('aabbccdd'));
      assert.deepEqual(m('aabbccdd'), 'ABCD');
    })
  })
});

describe('5.4', function() {
  
  class Id extends Array {
    constructor(value) {
      super(1);
      this.fill(value);
    }
    static of(value) {
      return new Id(value);
    }
    get() {
      return this[0];
    }
  }
  
  describe('functor', function() {
    it('should have an identity', function() {
      assert.equal([1].map(identity), 1);
      assert.equal(['hello world'].map(identity), 'hello world');
    }),
    it('should have composition', function() {
      const square = x => x * x;
      const times2 = x => x * 2;
      const add1 = x => x + 1;
      
      const r1 = [1, 2, 3, 4, 5].map(times2).map(square).map(add1);
      assert.deepEqual(r1, [5, 17, 37, 65, 101]);
      
      const r2 = [1, 2, 3, 4, 5].map(compose(add1, square, times2));
      assert.deepEqual(r2, [5, 17, 37, 65, 101]);
      
      assert.deepEqual(r1, r2);
    });
    describe('Id', function() {
      Object.assign(Id.prototype, Functor);
      
      it('should have a map', function() {
        const result = Id.of('hello world').map(unique).map(join).map(toUpper).get();
        assert.equal(result, 'HELO WRD');
      }),
      it('should have an identity', function() {
        const result = Id.of('hello world').map(identity).get();
        assert.equal(result, 'hello world');
      });
    });
  }),
  describe('monad', function() {
    describe('Id', function() {
      Object.assign(Id.prototype, Monad);
      
      const f = x => Id.of(x ** 2);
      
      it('should have a map', function() {
        assert.equal(Id.of(2).map(x => x ** 2).get(), 4);
      }),
      it('should have a flatMap', function() {
        assert.equal(Id.of(2).flatMap(f).get(), 4);
      }),
      it('should have a chain', function() {
        assert.equal(Id.of(2).chain(f).get(), 4);
      }),
      it('should have a bind', function() {
        assert.equal(Id.of(2).bind(f).get(), 4);
      }),
      it('should have left identity', function() {
        assert.deepEqual(Id.of(2).flatMap(f), f(2));
      }),
      it('should have right identity', function() {
        assert.deepEqual(Id.of(2).flatMap(x => Id.of(x)), Id.of(2));
      }),
      it('should be associative', function() {
        const g = x => Id.of(x * 2);
        const h = x => Id.of(x + 3);
        
        const r1 = Id.of(2).flatMap(f).flatMap(g).flatMap(h);
        const r2 = Id.of(2).flatMap(x => f(x).flatMap(y => g(y).flatMap(h)));
        assert.deepEqual(r1, r2);
      });
    });
  });
});

describe('5.5', function() {
  describe('ADT', function() {
    describe('Pair', function() {
      const Pair = (first, second) =>
        compose(Object.seal, Object.freeze)({
          first,
          second,
          toString: () => `[${first} ${second}]`
      });
      
      it('should have a toString', function() {
        const p = Pair(1, 2);
        assert.equal(p.toString(), '[1 2]');
      }),
      it('should have a first', function() {
        const p = Pair(1, 2);
        assert.equal(p.first, 1);
      }),
      it('should have a second', function() {
        const p = Pair(1, 2);
        assert.equal(p.second, 2);
      }),
      it('should be return able from a function', function() {
        const parts = (x, d) => Pair(Math.floor(x / d), x % d);
        const tenOverThree = parts(10, 3);
        assert.equal(tenOverThree.first, 3);
        assert.equal(tenOverThree.second, 1);
      });
    }),
    describe('Choice', function() {
      it('should return not false', function() {
        assert.equal(1, 1 || null);
        assert.equal(1, null || 1);
        assert.equal(1, false || 1);
        assert.equal(1, 0 || 1);
        assert.equal(1, '' || 1);
      }),
      it('should return not null', function() {
        assert.equal(1, 1 ?? null);
        assert.equal(1, null ?? 1);
        assert.equal('', null ?? '');
        assert.equal(false, null ?? false);
        assert.equal(false, false ?? true);
      });
    }),
    describe('Validation', function() {
      class Validation {
        #val;
        constructor(value) {
          this.#val = value;
          if (![Success.name, Failure.name].includes(new.target.name)) {
            throw new Error('Invalid constructor');
          }
        }
        
        static of(value) {
          return Success.of(value);
        }
        
        static Success(value) {
          return Success.of(value);
        }
        
        static Failure(value) {
          return Failure.of(value);
        }
          
        get() {
          return this.#val;
        }
        
        get isSuccess() {
          return false;
        }
        
        get isFailure() {
          return false;
        }
        
        getOrElse(other) {
          return this.isSuccess ? this.get() : other;
        }
        
        toString() {
          return `${this.constructor.name} (${this.#val})`;
        }
      }
      
      class Success extends Validation {
        static of(value) {
          return new Success(value);
        }
        
        get isSuccess() {
          return true;
        }
      }
      
      class Failure extends Validation {
        static of(value) {
          return new Failure(value);
        }
        
        get isFailure() {
          return true;
        }
        
        get() {
          throw new Error('Cannot get value of Failure');
        }
      }
      
      
      Object.assign(Failure.prototype, NoopFunctor);
      Object.assign(Success.prototype, Functor);
      
      Object.assign(Failure.prototype, NoopMonad);
      Object.assign(Success.prototype, Monad);
      
      describe('Success', function() {
        const sut = Success.of(1);
        it('should return true for isSuccess', function() {
          assert.equal(sut.isSuccess, true);
        }),
        it('should return false for isFailure', function() {
          assert.equal(sut.isFailure, false);
        }),
        it('should return the value', function() {
          assert.equal(sut.get(), 1);
        });
      }),
      describe('Failure', function() {
        const sut = Failure.of(1);
        it('should return false for isSuccess', function() {
          assert.equal(sut.isSuccess, false);
        }),
        it('should return true for isFailure', function() {
          assert.equal(sut.isFailure, true);
        }),
        it('should throw an error', function() {
          assert.throws(() => sut.get());
        });
      }),
      describe('composing', function() {
        const isEven = n =>
          n % 2 === 0
          ? Success.of(n)
          : Failure.of(`${n} is not even`);
          
        const isPositive = n =>
          n > 0
          ? Success.of(n)
          : Failure.of(`${n} is not positive`);
          
        describe('isEven', function() {
          it('should return Success for even values', function() {
            assert.equal(isEven(2).isSuccess, true);
          }),
          it('should return Failure for odd values', function() {
            assert.equal(isEven(3).isFailure, true);
          });
        }),
        describe('isPositive', function() {
          it('should return Success for positive values', function() {
            assert.equal(isPositive(2).isSuccess, true);
          }),
          it('should return Failure for negative values', function() {
            assert.equal(isPositive(-1).isFailure, true);
          });
        }),
        describe('compose isEven with isPositive', function() {
          const validator = n => Validation.of(n).flatMap(isEven).flatMap(isPositive);
          
          it('should return Success for even positive values', function() {
            assert.equal(validator(2).isSuccess, true);
          }),
          it('should return Failure for odd positive values', function() {
            assert.equal(validator(3).isFailure, true);
          });
        });
      });
    });
  });
});