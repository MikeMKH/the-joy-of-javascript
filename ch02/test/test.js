var assert = require('assert');

describe('2.1', function() {
  describe('Object.create', function() {
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
      const transaction = {
        sender: 'mharris@sender.com',
        recipient: 'kharris@recipient.com'
      };
      const moneyTransaction = Object.create(transaction);
      moneyTransaction.funds = 0.0;
      moneyTransaction.addFunds = function(amount = 0.0) { this.funds += amount; };
      
      moneyTransaction.addFunds(100.0);
      assert.equal(moneyTransaction.funds, 100.0);
      assert.ok(Object.getPrototypeOf(moneyTransaction) === transaction);
    });
  });
});