'use strict';

const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const sandbox = require('mocha-sandbox');
const request = require('hof-util-reqres').req;

chai.use(require('sinon-chai'));

const Behaviour = require('../');

const fs = require('fs');
const Emailer = require('hof-emailer');

// helper to avoid having to define full options every time
const options = (opts) => {
  return Object.assign({
    transport: 'stub',
    recipient: 'test@example.com',
    subject: 'confirmation email',
    template: '/path/to/to/my/email/template.html'
  }, opts);
};

describe('Emailer Behaviour', () => {

  beforeEach(() => {
    sinon.stub(fs, 'readFile').withArgs('/path/to/to/my/email/template.html').yieldsAsync(null, 'hello {{name}}');
    sinon.stub(Emailer.prototype, 'send').returns(Promise.resolve());
  });

  afterEach(() => {
    fs.readFile.restore();
    Emailer.prototype.send.restore();
  });

  it('exports a function', () => {
    expect(Behaviour).to.be.a('function');
  });

  describe('initialisation', () => {

    const make = (opts) => {
      return Behaviour(options(opts))(class {});
    };

    it('returns a mixin', () => {
      const opts = options({ recipient: 'test@example.com' });
      class Base {}
      const Mixed = Behaviour(opts)(Base);
      expect(new Mixed()).to.be.an.instanceOf(Base);
    });

    it('errors if no recipient is set', () => {
      expect(() => make({ recipient: null })).to.throw();
    });

    it('errors if no template is set', () => {
      expect(() => make({ template: null })).to.throw();
    });

  });

  describe('saveValues', () => {

    class Base {
      saveValues() {}
    }

    let controller;
    let req;

    beforeEach(() => {
      sinon.stub(Base.prototype, 'saveValues').yieldsAsync();
      const Email = Behaviour(options())(Base);
      controller = new Email();
      req = request();
    });

    afterEach(() => {
      Base.prototype.saveValues.restore();
    });

    it('exists, and is a function', () => {
      const Mixed = Behaviour(options())(class {});
      const instance = new Mixed();
      expect(instance).to.have.property('saveValues');
      expect(instance.saveValues).to.be.a('function');
    });

    it('sends an email to the configured recipient', done => {
      controller.saveValues(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Emailer.prototype.send).to.have.been.calledWith(sinon.match({
          recipient: 'test@example.com'
        }));
      }, done));
    });

    it('loads the recipient address from the session model if configured with a key', done => {
      const opts = options({ recipient: 'user-email' });
      const Email = Behaviour(opts)(Base);
      controller = new Email();
      req.sessionModel.set('user-email', 'user@example.com');
      controller.saveValues(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Emailer.prototype.send).to.have.been.calledWith(sinon.match({
          recipient: 'user@example.com'
        }));
      }, done));
    });

    it('loads the recipient address from a function if passed', done => {
      const opts = options({ recipient: data => `${data.name}@example.com` });
      const Email = Behaviour(opts)(Base);
      controller = new Email();
      req.sessionModel.set('name', 'bob');
      controller.saveValues(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Emailer.prototype.send).to.have.been.calledWith(sinon.match({
          recipient: 'bob@example.com'
        }));
      }, done));
    });

    it('sends an email with a body of a rendered template', done => {
      req.sessionModel.set('name', 'Alice');
      controller.saveValues(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Emailer.prototype.send).to.have.been.calledWith(sinon.match({
          body: 'hello Alice'
        }));
      }, done));
    });

    it('sends an email with the configured subject', done => {
      controller.saveValues(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Emailer.prototype.send).to.have.been.calledWith(sinon.match({
          subject: 'confirmation email'
        }));
      }, done));
    });

    it('loads the subject from a function if passed', done => {
      const opts = options({ subject: data => `application for ${data.name}` });
      const Email = Behaviour(opts)(Base);
      controller = new Email();
      req.sessionModel.set('name', 'bob');
      controller.saveValues(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Emailer.prototype.send).to.have.been.calledWith(sinon.match({
          subject: 'application for bob'
        }));
      }, done));
    });

    it('calls through to super.saveValues when complete', done => {
      controller.saveValues(req, {}, sandbox(err => {
        expect(err).not.to.exist;
        expect(Base.prototype.saveValues).to.have.been.calledWith(req, {});
        expect(Base.prototype.saveValues).to.have.been.calledAfter(Emailer.prototype.send);
      }, done));
    });

    it('calls back with error if template cannot be loaded', done => {
      const err = new Error('readfile failed');
      fs.readFile.withArgs('/path/to/to/my/email/template.html').yieldsAsync(err);
      controller.saveValues(req, {}, sandbox(e => {
        expect(e).to.equal(err);
      }, done));
    });

  });

});
