const { equal } = require('assert');
var assert = require('assert');
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

describe('define class in an object namespace', function() {
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
});