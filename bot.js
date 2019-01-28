var discord = require('discord.io');
var auth = require('./auth.json');
var addr = require('./addr.json');
var zmq = require('zmq');
var _channelID = '';

const ZMQ_HOST = 'localhost';
const ZMQ_PORT = 5562;
const ZMQ_ADDR = 'tcp://' + ZMQ_HOST + ':' + ZMQ_PORT;
const ZMQ_TYPE = 'req';

console.log('--------------------------------------');
console.log('Info: IDB (Ictmon Discord Bot) started.');

const socket = zmq.socket(ZMQ_TYPE);
socket.connect(ZMQ_ADDR);
console.log('Info: Trying to connect to Ictmon API on: ' + ZMQ_ADDR);

var resource_base_url = 'http://' + addr.address + ':' + addr.port + '/';
console.log('Info: Resource base URL: ' + resource_base_url);
console.log('--------------------------------------');

socket.on('message', function (msg) {
	var msg_str = msg.toString();
	console.log('Info: Response received: ', msg_str);

	var parts = msg_str.split(";");
	var request = parts[0];

	if (request == 'tps') {
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
	} else if (request == 'tps10') {
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

	} else if (request == 'graph') {
		var filename = parts[1];
		var url = resource_base_url + filename;
		var data = {
			"to": _channelID,
			"embed": {
				"color": 532392,
				"image": {
					"url": `${url}`
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
	console.log('Sending tps10 request...');
	socket.send('tps10');
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
			case 'help': {
				bot.sendMessage({
					to: channelID,
					message: "```!tps\n!tps10\n!graph\n```"

				});
				break;
			}
			case 'tps': {
				sendTpsRequest();
				break;
			}
			case 'tps10': {
				sendTps2Request();
				break;
			}
			case 'graph': {
				sendGraphRequest();
				break;
			}
		}
	}
});
