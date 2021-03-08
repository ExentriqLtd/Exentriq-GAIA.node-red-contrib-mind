module.exports = function(RED) {
    var request = require("request");

    function Mind(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        this.on('input', function(msg) {
            var action = config.action;
            var endpoint = config.endpoint;
            var url = '';
            console.log(action);
            console.log(endpoint);

            var opts = {};
            switch(action){
                case 'echo':
                    opts.url = [endpoint,'mind/echo',msg.topic || 'test'].join('/');
                    opts.method = 'GET';
                    break;
                case 'status':
                    opts.url = [endpoint,'mind/status',msg.topic || '-'].join('/');
                    opts.method = 'GET';
                    break;
                case 'query':
                    opts.url = [endpoint,'mind/query',msg.topic || '-'].join('/');
                    opts.method = 'GET';
                    break;
                case 'training':
                    opts.url = [endpoint,'mind/training'].join('/');
                    opts.method = 'POST';
                    opts.formData = {
                        file: msg.payload,
                        fileName: msg.filename || config.filename,
                        flowName: msg.flowName || config.flowName,
                        uuidWorkspace: msg.workspaceUuid || config.workspaceUuid
                    };

                    break;
                case 'prediction':
                    opts.url = [endpoint,'mind/prediction'].join('/');
                    opts.method = 'POST';
                    opts.formData = {
                        file: msg.payload,
                        fileName: msg.filename || config.filename,
                        flowName: msg.flowName || config.flowName,
                        uuidWorkspace: msg.workspaceUuid || config.workspaceUuid
                    };
                    break;
                default:
                    opts.url = [endpoint,'mind/echo/default'].join('/');
                    opts.method = 'GET';
            }
            console.log(url);

            opts.timeout = node.reqTimeout;
            opts.headers = {};

            request(opts, function(err, res, body) {
                if(err){
                    node.error(err, msg);
                    node.status({fill:"red", shape:"ring", text:err.code});
                    msg.payload = err.toString() + " : " + url;
                    msg.statusCode = err.code;
                    node.send(msg);
                }
                else{
                    try {
                        msg.payload = JSON.parse(body);
                    } catch (error) {
                        msg.payload = body;
                    }
                    
                    node.send(msg);
                }
            });
        });
    }

    RED.nodes.registerType("mind",Mind);
}
