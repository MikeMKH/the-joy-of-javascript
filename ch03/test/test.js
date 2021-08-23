var assert = require('assert');

describe('3.1', function() {
  const UpperCaseFormatter = {
    format: function(str) {
      return str.toUpperCase();
    }
  };
  it('implicit link, is-a', function() {
    // Foo is-a UpperCaseFormatter
    const Foo = Object.create(UpperCaseFormatter);
    Foo.say = function say(msg) {
      return this.format(msg);
    };
    assert.equal(Foo.say("hello"), "HELLO");
  }),
  it('explicit link, has-a', function() {
    // Foo has-a UpperCaseFormatter
    const Foo = {
      formatter: UpperCaseFormatter,
      say: function say(msg) {
        return this.formatter !== null
        ? this.formatter.format(msg)
        : msg;
      }
    };
    assert.equal(Foo.say("hello"), "HELLO");
  });
}),
describe('3.2', function() {
  it('should link objects', function() {
    const MyStore = {
      init(element) {
        this.length = 0;
        this.push(element);
        return this;
      },
      push(element) {
        this[this.length] = element;
        return ++this.length;
      }
    };
      const Blockchain = Object.create(MyStore);
      const chain = Object.create(Blockchain).init("genesis block");
      
      assert.equal(chain.length, 1);
      assert.equal(chain[0], "genesis block");
      assert.ok(MyStore.isPrototypeOf(chain));
  }),
  it('should model Transaction behavior delegation', function() {
    const Transaction = {
      init(sender, recipient, funds = 0.0) {
        const _feePercent = 0.06;
        
        this.sender = sender;
        this.recipient = recipient;
        this.funds = funds;
        
        this.netTotal = function netTotal() {
          return _precisionRound(this.funds * _feePercent, 2);
        };
        this.display = function display() {
          return `${this.sender} -> ${this.recipient}: ${this.funds}`;
        };
        
        function _precisionRound(value, precision) {
          const factor = Math.pow(10, precision);
          return Math.round(value * factor) / factor;
        }
      }
    };
    
    const HashTransaction = Object.create(Transaction);
    HashTransaction.init = function HashTransaction(sender, recipient, funds) {
      Transaction.init.call(this, sender, recipient, funds);
      this.transactionId = this.calculateHash();
      return this;
    };
    HashTransaction.calculateHash = function calculateHash() {
      const data = [this.sender, this.recipient, this.funds].join('');
        let hash = 0, i = 0;
        while (i < data.length) {
          hash = (hash << 5) - hash + data.charCodeAt(i++) << 0;
        }
        return hash**2;
    };
    
    const tx = Object.create(HashTransaction).init("mike", "kelsey", 100.00);
    assert.equal(tx.display(), "mike -> kelsey: 100");
    assert.equal(tx.netTotal(), 6.0);
    assert.equal(tx.calculateHash(), 2692384909165950500);
  });
});

describe('3.3', function() {
  describe('Object.assign', function() {
    it('should allow for defaults to be provided', function() {
      function foo(config = {}) {
        config = Object.assign(
          {
            a: 1,
            b: 2
          }, config);
        return `a=${config.a}, b=${config.b}`;
      }
      
      assert.equal(foo(), "a=1, b=2");
      assert.equal(foo({a: 100}), "a=100, b=2");
      assert.equal(foo({b: 'Hi'}), "a=1, b=Hi");
    }),
    it('should allow for values to be hidden', function() {
      const a = { a: 1 };
      const b = {};
      Object.defineProperty(b, 'b', {
        value: 'secret',
        enumerable: false
      });
      
      assert.equal(Object.assign(a, b), a);
    }),
    it('should call set', function() {
      var called = false;
      const Transaction = {
        _sender: 'mharris@sender.com',
        
        get sender() { return this._sender; },
        set sender(value) {
          called = true;
          this._sender = Transaction.validateEmail(value);
        }
      };
      
      // REGEX from copilot
      const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      Transaction.validateEmail = function validateEmail(email) {
        if (EMAIL_REGEX.test(email)) {
          return email;
        } else {
          throw new Error('Invalid email address');
        }
      };
      
      assert.throws(() => Object.assign(Transaction, { sender: 'invalid' }), Error);
      assert.ok(called);
      
      Object.assign(Transaction, { sender: 'valid@email.com' });
    });
  });
});

describe('3.4', function() {
  const HasA = {
    a: 1,
    af : function af() { return this.a + '!'; }
  };
  const HasB = {
    b: 2,
    bf : function bf() { return this.b + '?'; }
  };
  const HasC = {
    c: 3,
    cf : function cf() { return this.c + '#'; }
  };
  
  it('should allow the assemble objects using mixin composition', function() {
    const Obj = (something = 'book', someOne = 'jack') =>
      Object.assign({something, someOne}, HasA, HasB, HasC);
    
    const o1 = Obj();
    assert.equal(o1.something, 'book');
    assert.equal(o1.someOne, 'jack');
    
    const o2 = Obj('ball', 'mike');
    assert.equal(o2.something, 'ball');
    assert.equal(o2.someOne, 'mike');
    
    assert.equal(o1.af(), '1!');
    assert.equal(o2.af(), '1!');
    assert.equal(o1.af(), o2.af());
    
    assert.equal(o1.bf(), '2?');
    assert.equal(o2.bf(), '2?');
    assert.equal(o1.bf(), o2.bf());
    
    assert.equal(o1.cf(), '3#');
    assert.equal(o2.cf(), '3#');
    assert.equal(o1.cf(), o2.cf());
  }),
  it('should allow the assemble objects using mixin composition using spread operator', function() {
    const Obj = (something = 'book', someOne = 'jack') => ({
      something,
      someOne,
      ...HasA,
      ...HasB,
      ...HasC
    });
    
    const o1 = Obj();
    assert.equal(o1.something, 'book');
    assert.equal(o1.someOne, 'jack');
    
    const o2 = Obj('ball', 'mike');
    assert.equal(o2.something, 'ball');
    assert.equal(o2.someOne, 'mike');
    
    assert.equal(o1.af(), '1!');
    assert.equal(o2.af(), '1!');
    assert.equal(o1.af(), o2.af());
    
    assert.equal(o1.bf(), '2?');
    assert.equal(o2.bf(), '2?');
    assert.equal(o1.bf(), o2.bf());
    
    assert.equal(o1.cf(), '3#');
    assert.equal(o2.cf(), '3#');
    assert.equal(o1.cf(), o2.cf());
  });
});