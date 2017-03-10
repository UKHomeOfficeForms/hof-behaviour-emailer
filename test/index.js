'use strict';

const expect = require('chai').expect;

const Behaviour = require('../');

describe('Emailer Behaviour', () => {

  it('exports a function', () => {
    expect(Behaviour).to.be.a('function');
  });

  it('returns a mixin', () => {
    class Base {}
    const Mixed = Behaviour()(Base);
    expect(new Mixed()).to.be.an.instanceOf(Base);
  });

});
