var assert = require('assert');

describe('2.1', function() {
  describe('Object.create', function() {
    const transaction = {
      sender: 'mharris@sender.com',
      recipient: 'kharris@recipient.com'
    };
    
    it('should crete object from proto', function() {
      var proto = {
        sender: 'mharris@sender.com'
      };
      const child = Object.create(proto);
      child.recipient = 'kharris@recipient.com';
      
      assert.equal(child.sender, 'mharris@sender.com');
      assert.equal(child.recipient, 'kharris@recipient.com');
    }),
    it('should create object with links', function() {
      const moneyTransaction = Object.create(transaction);
      moneyTransaction.funds = 0.0;
      moneyTransaction.addFunds = function(amount = 0.0) { this.funds += amount; };
      
      moneyTransaction.addFunds(100.0);
      assert.equal(moneyTransaction.funds, 100.0);
      assert.ok(Object.getPrototypeOf(moneyTransaction) === transaction);
    }),
    it('should create object from data descriptors', function() {
      const moneyTransaction = Object.create(transaction, {
        funds: {
          value: 0.0,
          enumerable: true,
          writable: true,
          configurable: false
        }
      });
      assert.equal(moneyTransaction.funds, 0.0);
      assert.ok(Object.getPrototypeOf(moneyTransaction) === transaction);
      
      moneyTransaction.funds = 100.0;
      assert.equal(moneyTransaction.funds, 100.0);
    }),
    it('should create object from proto', function() {
      const moneyTransaction = {
        __proto__: transaction,
        funds: 0.0,
        addFunds: function(amount = 0.0) {
          this.funds += amount;
          return this;
        }
      };
      
      moneyTransaction.addFunds(100.0);
      assert.equal(moneyTransaction.funds, 100.0);
      assert.ok(Object.getPrototypeOf(moneyTransaction) === transaction);
    }),
    it('should create object from differential inheritance', function() {
      const hashTransaction = Object.create(transaction);
      hashTransaction.calculateHash = function calculateHash() {
        const data = [this.sender, this.recipient].join('');
        let hash = 0, i = 0;
        while (i < data.length) {
          hash = (hash << 5) - hash + data.charCodeAt(i++) << 0;
        }
        return hash**2;
      };
      
      assert.equal(hashTransaction.calculateHash(), 3259099186266481000);
      
      const moneyTransaction = Object.setPrototypeOf({}, hashTransaction);
      moneyTransaction.funds = 0.0;
      moneyTransaction.addFunds = function(amount = 0.0) { this.funds += Number(amount); };
      moneyTransaction.addFunds(100.0);
      
      assert.equal(moneyTransaction.calculateHash(), 3259099186266481000);
      assert.equal(moneyTransaction.sender, 'mharris@sender.com');
      assert.equal(moneyTransaction.recipient, 'kharris@recipient.com');
      assert.equal(moneyTransaction.funds, 100.0);
      assert.ok(Object.getPrototypeOf(moneyTransaction) === hashTransaction);
    });
  });
});

describe('2.2', function() {
  describe('Constructor Functions', function() {
    function Transaction (sender, recipient) {
      this.sender = sender;
      this.recipient = recipient;
    };
    
    function HashTransaction (sender, recipient) {
      if (!new.target) {
        return new HashTransaction(sender, recipient);
      }
      Transaction.call(this, sender, recipient);
      this.calculateHash = function calculateHash() { 
        const data = [this.sender, this.recipient].join('');
        let hash = 0, i = 0;
        while (i < data.length) {
          hash = (hash << 5) - hash + data.charCodeAt(i++) << 0;
        }
        return hash**2;
      }      
    };
    
    HashTransaction.prototype = Object.create(Transaction.prototype);
    HashTransaction.prototype.constructor = HashTransaction;
    
    it('should create object from constructor function', function() {
      const tx = new HashTransaction('mharris@sender.com', 'kharris@recipient.com');
      assert.equal(tx.sender, 'mharris@sender.com');
      assert.equal(tx.recipient, 'kharris@recipient.com');
      assert.equal(tx.calculateHash(), 3259099186266481000);
    }),
    it('should use same prototype reference', function() {
      const tx = new HashTransaction('mharris@sender.com', 'kharris@recipient.com');
      assert.ok(tx.__proto__ === HashTransaction.prototype);
    }),
    it('should add a new method object for calculateHash to each instances', function() {
      const tx1 = new HashTransaction('mharris@sender.com', 'kharris@recipient.com');
      const tx2 = new HashTransaction('mharris@sender.com', 'kharris@recipient.com');
      assert.notDeepStrictEqual(tx1.calculateHash, tx2.calculateHash);      
    }),
    it('should be able to add method object to all instances', function() {
      HashTransaction.prototype.foo = function foo() {}; // note difference to calculateHash
      const tx1 = new HashTransaction('mharris@sender.com', 'kharris@recipient.com');
      const tx2 = new HashTransaction('mharris@sender.com', 'kharris@recipient.com');
      assert.deepStrictEqual(tx1.foo, tx2.foo);  
    });
  });
});