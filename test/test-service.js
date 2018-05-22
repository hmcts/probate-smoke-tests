var chai = require('chai');
var expect = require('chai').expect;
var chaiHttp = require('chai-http');

require('dotenv').config({path: 'process.env'});

let  serviceURL;
let hostName;
let port;
process.argv.forEach((val, index) => {
    if (val === '--URL') {
        serviceURL = process.argv[index + 1];
    }

    if (val === '--ENV') {
        let env = (process.argv[index + 1]).toLowerCase();
        console.log(env);
        if(env === 'test')
            hostName = process.env.TEST_APP_HOSTNAME;
        if(env === 'dev')
            hostName = process.env.DEV_APP_HOSTNAME;
        if(env === 'demo')
            hostName = process.env.DEMO_APP_HOSTNAME;
        if(env === 'prod')
            hostName = process.env.PROD_APP_HOSTNAME;    
        if(env === 'preprod')
            hostName = process.env.PREPROD_APP_HOSTNAME; 
        console.log(hostName);
    }

    if (val === '--SERVICE') {
        let servicname = (process.argv[index + 1]).toLowerCase();
        console.log(servicname);
        if(servicname === 'business-service')
            port = process.env.BUSINESS_SERVICE_PORT;
        if(servicname === 'submit-service')
            port = process.env.SUBMIT_SERVICE_PORT;
        if(servicname === 'persistence-service')
            port = process.env.PERSISTENCE_SERVICE_PORT;
        console.log(port);
    }
});


chai.use(chaiHttp);
chai.request.Request = chai.request.Test;
require('superagent-proxy')(chai.request);

var healthcheckProxyRequest = function(url) {
  var req = chai.request(url).get('/health');
  if (typeof(proxy) !== 'undefined') {
    req = req.proxy(proxy)
  }
  console.log(req.url);
  return req;
};

describe('Service health check', function () {
    it('Returns a 200 status code', function (done) {

        healthcheckProxyRequest(serviceURL?serviceURL:hostName+":"+port)
            .then(function (res) {
                expect(res).to.have.status(200);
            })
            .then(() => done(), err => done(err));
    });
    
    it('Returns status UP', function (done) {
        healthcheckProxyRequest(serviceURL?serviceURL:hostName+":"+port)
            .then(function (res) {
            expect(res.body.status).to.deep.equal('UP');
            })
            .then(() => done(), err => done(err));
    });
});
