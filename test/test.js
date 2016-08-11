var should     = require('should');
var specHelper = require(__dirname + '/specHelper');
var api;
var csrfToken;
var connection;

describe('general:applicaiton', function(){
  before(function(){ api = specHelper.api; });
  before(function(){ connection = new api.specHelper.connection(); })
  before(function(done){ specHelper.truncate(done); });

  it('can boot', function(done){
    api.running.should.equal(true);
    done();
  });

  it('can access unprotected actions without logging in', function(done){
    connection.params = {};
    api.specHelper.runAction('status', connection, function(response){
      should.not.exist(response.error);
      response.id.should.equal('test-server');
      done();
    });
  });

  it('cannot access protected actions without logging in', function(done){
    connection.params = {};
    api.specHelper.runAction('showDocumentation', connection, function(response){
      response.error.should.equal('Error: Please log in to continue');
      done();
    });
  });

  it('can create a user (success)', function(done){
    connection.params = {
      firstName: 'first',
      lastName: 'last',
      email: 'fake@fake.com',
      password: 'password',
    };
    api.specHelper.runAction('user:create', connection, function(response){
      should.not.exist(response.error);
      should.exist(response.user);
      done();
    });
  });

  it('can create a user (fail, duplicate)', function(done){
    connection.params = {
      firstName: 'first',
      lastName: 'last',
      email: 'fake@fake.com',
      password: 'password',
    };
    api.specHelper.runAction('user:create', connection, function(response){
      response.error.should.equal('Error: users_email must be unique');
      should.not.exist(response.user);
      done();
    });
  });

  it('can create a user (fail, missing param)', function(done){
    connection.params = {
      firstName: 'first',
      email: 'fake@fake.com',
      password: 'password',
    };
    api.specHelper.runAction('user:create', connection, function(response){
      response.error.should.equal('Error: lastName is a required parameter for this action');
      should.not.exist(response.user);
      done();
    });
  });

  it('can log in', function(done){
    connection.params = {
      email: 'fake@fake.com',
      password: 'password',
    };
    api.specHelper.runAction('session:create', connection, function(response){
      should.not.exist(response.error);
      should.exist(response.user);
      should.exist(response.csrfToken);
      csrfToken = response.csrfToken
      done();
    });
  });

  it('can view my user', function(done){
    connection.params = {csrfToken: csrfToken};
    api.specHelper.runAction('user:view', connection, function(response){
      should.not.exist(response.error);
      should.exist(response.user);
      done();
    });
  });

  it('can edit my user', function(done){
    connection.params = {
      csrfToken: csrfToken,
      firstName: 'newName'
    };
    api.specHelper.runAction('user:edit', connection, function(response){
      should.not.exist(response.error);
      should.exist(response.user);
      response.user.firstName.should.equal('newName');
      done();
    });
  });

  it('can access protected actions when logged in + csrf', function(done){
    connection.params = { csrfToken: csrfToken };
    api.specHelper.runAction('showDocumentation', connection, function(response){
      should.not.exist(response.error);
      done();
    });
  });

  it('cannot access protected actions when logged in without csrf', function(done){
    connection.params = {};
    api.specHelper.runAction('showDocumentation', connection, function(response){
      response.error.should.equal('Error: CSRF error');
      done();
    });
  });

});
