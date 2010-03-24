(function(){
  var Connection = Strophe.Connection;
  var Mock = Strophe.Mock = {};

  Mock.Connection = {};

  var Good = Mock.Connection.Good = function(){
    Connection.apply(this, arguments);
  };

  Good.prototype = new Connection;
  Good.prototype.constructor = Good;

  Good.prototype.connect =
    function connect(jid, pass, callback, wait, hold, wind) {
      this.jid = jid;
      this.callback = callback;
      if(this.callback) {
        var self = this;
        this.callback(Strophe.Status.CONNECTING);
        setTimeout(function(){self.callback(Strophe.Status.AUTHENTICATING);},0);
        setTimeout(function(){self.callback(Strophe.Status.CONNECTED);},0);
      }
    };

  Good.prototype.fail = function() {
    if(this.callback){
      var self = this;
      setTimeout(function(){self.callback(Strophe.Status.CONNFAIL);},0);
      setTimeout(function(){self.callback(Strophe.Status.DISCONNECTED);},0);
    };
  };

  Good.prototype.uri = function() {
    return "xmpp::user@host/resource";
  };

  var Bad = Mock.Connection.Bad = function(){
    Connection.apply(this, arguments);
  };

  Bad.prototype = new Connection;
  Bad.prototype.constructor = Bad;

  Bad.prototype.connect =
    function connect(jid, pass, callback, wait, hold, wind) {
      this.callback = callback;
      if(callback) {
        callback(Strophe.Status.CONNECTING);
        setTimeout(function(){callback(Strophe.Status.CONNFAIL);},0);
      }
    };

  Bad.prototype.abort =
    function abort() {
      if(this.callback){
        var self = this;
        setTimeout(function(){self.callback(Strophe.Status.DISCONNECTED);},0);
      }
    };

  var SameDomain = Mock.Connection.SameDomain = function(){
    Connection.apply(this, arguments);
  };

  SameDomain.prototype = new Connection;
  SameDomain.prototype.constructor = SameDomain;

  SameDomain.prototype.connect =
    function connect(jid, pass, callback, wait, hold, wind) {
      // debug("SD",document.domain);
      this.callback = callback;
      if(callback) {
        callback(Strophe.Status.CONNECTING);
        setTimeout(function(){callback(Strophe.Status.CONNFAIL);},0);
      }
    };

  SameDomain.prototype.abort =
    function abort() {
      if(this.callback){
        var self = this;
        setTimeout(function(){self.callback(Strophe.Status.DISCONNECTED);},0);
      }
    };

})();
