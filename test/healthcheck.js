var chai = require('chai');
var expect = require('chai').expect;
var chaiHttp = require('chai-http');

require('dotenv').config({path: 'process.env'});

var frontendURL = process.env.PROBATE_FRONTEND_URL;
var hostnamePrefix = process.env.HOSTNAME_PREFIX;
var frontendCommitSha = process.env.FRONTEND_COMMIT_SHA;

var reHostName = new RegExp(`^${hostnamePrefix}0[12]`);

chai.use(chaiHttp);
chai.request.Request = chai.request.Test;
require('superagent-proxy')(chai.request);

var healthcheckProxyRequest = function(url) {
  var req = chai.request(url).get('health');
  if (typeof(proxy) !== 'undefined') {
    req = req.proxy(proxy)
  }
  return req;
};

describe('Probate frontend health check', function () {
  it('Returns a 200 status code', function (done) {
   
    healthcheckProxyRequest(frontendURL).end(function (err, res) {
      expect(res).to.have.status(200);
      done();
    });
  });

  it('Returns status UP', function (done) {
    healthcheckProxyRequest(frontendURL).end(function (err, res) {
      expect(res.body.status).to.deep.equal('UP');
      done();
    });
  });

  it('Returns backend services with status UP', function(done) {
      healthcheckProxyRequest(frontendURL).end(function (err, res) {
          const downstream = res.body.downstream;
          downstream.forEach( service => expect(service.status).to.deep.equal('UP') );
          done();
      });
  });

  it('Returns the hostname', function (done) {
    healthcheckProxyRequest(frontendURL).end(function (err, res) {
      expect(res.body).to.have.property('host');
      done();
    });
  });

});
