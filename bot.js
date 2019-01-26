var discord = require('discord.io');
var auth = require('./auth.json');
var addr = require('./addr.json');
var zmq = require('zmq');
var _channelID = '';

const ZMQ_HOST = 'tcp://localhost';
const ZMQ_PORT = 5562;

console.log('ictmon Discord bot started.');
console.log('Trying to connect...');


var uri_me = 'http://'+addr.address+':'+addr.port+'/me.png'; 
console.log(uri_me);

var uri_graph = 'http://'+addr.address+':'+addr.port+'/graph.png';
console.log(uri_graph);

const socket = zmq.socket('req');
socket.connect(ZMQ_HOST + ':' + ZMQ_PORT);

socket.on('message', function (msg) {
	console.log('Response received');
	
	var test = msg.toString();
	var parts = test.split(":");
	var topic = parts[0];
	
	if (topic == 'tps') {
		var tps = parts[1]; 
		var data = {
			"to": _channelID,
			"embed": {
				"color": 532392,
				"fields": [
					{
						"name": "TPS (1 minute)",
						"value": `${tps}`,
						"inline": true
					},
				]
			}
		};
	} else if (topic == 'tps10') {
		var tps = parts[1]; 
		var data = {
			"to": _channelID,
			"embed": {
				"color": 532392,
				"fields": [
					{
						"name": "TPS (10 minutes)",
						"value": `${tps}`,
						"inline": true
					},
				]
			}
		};
		
	} else if (topic == 'graph') {
		var data = {
			"to": _channelID,
			"embed": {
				"color": 532392,
				"image": {
					"url": `${uri_graph}`
				}
			}
		};
	}

	bot.sendMessage(data);
});

function sendTpsRequest() {
	console.log('Sending tps request...');
	socket.send('tps');
}

function sendTps2Request() {
	console.log('Sending tps2 request...');
	socket.send('tps2');
}

function sendGraphRequest() {
	console.log('Sending graph request...');
	socket.send('graph');
}

var bot = new discord.Client({
	token: auth.token,
	autorun: true
});

bot.on('ready', function (evt) {
	console.log('Connected.');
	console.log('Logged in as: ' + bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {

	_channelID = channelID;

	if (message.substring(0, 1) == '!') {
		var args = message.substring(1).split(' ');
		var cmd = args[0];


		args = args.splice(1);
		switch (cmd) {
			case 'tps': {
				sendTpsRequest();
				break;
			}
			case 'tps2': {
				sendTps2Request();
				break;
			}
			case 'm#': {
				bot.sendMessage({
					to: channelID,
					message: "He left me for a shorter hash!!! :cry: "
				});
				break;
			}
			case 'ixuz': {
				bot.sendMessage({
					to: channelID,
					message: "Let's play poker!"
				});
				break;
			}
			case 'cfb': {
				bot.sendMessage({
					to: channelID,
					message: "Yes?"
				});
				break;
			}
			case 'graph': {
				sendGraphRequest();
				break;
			}
			case 'me': {
				var data = {
					"to": _channelID,
					"embed": {
						"color": 532392,
						"image": {
							"url": `${uri_me}`
						}
					}
				};
				bot.sendMessage(data);
				break;
			}
		}
	}
});
