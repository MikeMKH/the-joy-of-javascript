// mocha watch does not support esm modules https://github.com/mochajs/mocha/issues/4374
const { equal } = require('assert');
const assert = require('assert');

describe('class in an object namespace', function() {
  let MyObjectClass = global.MyObjectClass || {};
  MyObjectClass.domain = {};
  
  MyObjectClass.domain.MyObject = class {
    #feePercent = 0.6;
    constructor(sender, receiver, funds = 0.0) {
      this.sender = sender;
      this.receiver = receiver;
      this.funds = Number(funds);
      this.timestamp = Date.now();
    }
    
    static #precisionRounding(number, precision) {
      const factor = Math.pow(10, precision);
      return Math.round(number * factor) / factor;
    }
    
    netTotal() {
      return MyObjectClass.domain.MyObject.#precisionRounding(this.funds * this.#feePercent, 2);
    }
  }
  
  it('should calculate netTotal', function() {
    const myObject = new MyObjectClass.domain.MyObject('sender', 'receiver', 100.0);
    assert.equal(myObject.netTotal(), 60.0); 
  })
}),
describe('IIFE', function() {
  (function(namespace) {
    const VERSION = '1.0.0';
    namespace.domain = {};
    namespace.domain.MyObject = class {
      #feePercent = 0.6;
      
      constructor(sender, receiver, funds = 0.0) {
        this.sender = sender;
        this.receiver = receiver;
        this.funds = Number(funds);
        this.timestamp = Date.now();
        this.netTotal = netTotal(this.funds, this.#feePercent);
      }
    }
    
    function precisionRounding(number, precision) {
      const factor = Math.pow(10, precision);
      return Math.round(number * factor) / factor;
    }
    
    function netTotal(funds, feePercent) {
      return precisionRounding(funds * feePercent, 2);
    }
  })(global.MyIIFE || (global.MyIIFE = {}));
  
  it('should calculate netTotal', function() {
    const myObject = new global.MyIIFE.domain.MyObject('sender', 'receiver', 100.0);
    assert.equal(myObject.netTotal, 60.0); 
  });
}),
describe('factory function', function() {
  function MyObjectService(myObject) {
    const feePercent = 0.6;
    
    function precisionRounding(number, precision) {
      const factor = Math.pow(10, precision);
      return Math.round(number * factor) / factor;
    }
    
    function netTotal() {
      return precisionRounding(myObject.funds * feePercent, 2);
    }
    
    return {
      netTotal
    };
  }
  
  const MyObject = class {
    constructor(sender, receiver, funds = 0.0) {
      this.sender = sender;
      this.receiver = receiver;
      this.funds = Number(funds);
      this.timestamp = Date.now();
    }
  };
  
  it('should calculate netTotal', function() {
    const myObject = new MyObject('sender', 'receiver', 100.0);
    const service = new MyObjectService(myObject);
    assert.equal(service.netTotal(), 60.0);
  });
});