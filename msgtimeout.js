
module.exports = function(RED) {
  'use strict';
  function msgTimeOut(n) {
    RED.nodes.createNode(this, n);

    var node = this;
    var timeout = null;
    var flowContext   = node.context().flow;
    var globalContext = node.context().global;
    var msgCount = 0;
    node.units = n.units || 's';
    node.duration = n.duration || 5;
    node.onmsgtimeoutval  = n.onmsgtimeoutval || '0';
    node.onmsgtimeouttype = n.onmsgtimeouttype || 'str';

    if (node.duration <= 0) {
      node.duration = 0;
    } else {
      if (node.units === 's')   { node.duration = node.duration * 1000;           }
      if (node.units === 'min') { node.duration = node.duration * 1000 * 60;      }
      if (node.units === 'hr')  { node.duration = node.duration * 1000 * 60 * 60; }
    }


    if ((node.onmsgtimeouttype === 'num') && (!isNaN(node.onmsgtimeoutval))) {
      node.onmsgtimeoutval = Number(node.onmsgtimeoutval);
    } 
    else 
    if (node.onmsgtimeoutval === 'true' || node.onmsgtimeoutval === 'false') {
       (node.onmsgtimeoutval === 'true' ? node.onmsgtimeoutval = true : node.onmsgtimeoutval = false);
    } 
    else 
    if (node.onmsgtimeoutval === 'null') {
      node.onmsgtimeouttype = 'null';
      node.onmsgtimeoutval  =  null;
    } 
    else 
      node.onmsgtimeoutval = String(node.onmsgtimeoutval);

    node.on('input', function(msg) {
      msgCount = msgCount+1;
      node.send([msg,null]);
      clearTimeout(timeout);
      node.status({fill:'green', shape:'dot'});
      timeout = setTimeout(function() {
        var msg2 = RED.util.cloneMessage(msg);
        msg2.payload = node.onmsgtimeoutval;
        msg2.msgCount = msgCount;
        if (node.onmsgtimeouttype === 'flow')   { msg2.payload = flowContext.get(node.onmsgtimeoutval);   }
   else if (node.onmsgtimeouttype === 'global') { msg2.payload = globalContext.get(node.onmsgtimeoutval); }
        node.send([null,msg2]);
        timeout = null;
        msgCount = 0;
        node.status({fill:'red', shape:'ring', text:'msg timeout'});
      }, node.duration);
    });

    node.on('close', function() {
      if (timeout) {
        clearTimeout(timeout);
      }
      node.status({});
    });
  }
  RED.nodes.registerType('msgtimeout', msgTimeOut);
};
