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