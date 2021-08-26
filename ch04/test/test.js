var assert = require('assert');

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