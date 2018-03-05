// webserv/index.js
// The debugging webserver.

global.getLogger = function() {
	return {
		log : ()=>{},
		logRaw: ()=>{},
		debug: ()=>{},
		note: ()=>{},
		trace: ()=>{},
		info: ()=>{},
		warn: ()=>{},
		error: ()=>{},
		fatal: ()=>{},
		mark: ()=>{},
		l4js : {},
	};
}

global.Bot = {
	opt: {},
	setOpt(key,val){ this.opt[key] = val; },
	runOpts(id){ return this.opt[id] || false; },
};

const path = require('path');

class WebServer {
	constructor() {
		this.server = null;
	}
	
	connect() {
		const express = require('express');
		const app = express();
		const serv = (()=>{
			/*eslint no-constant-condition: 0*/
			if (false) { //TODO check in options for paths to security certs and the like
				return require('https').createServer({}, app);
			} else {
				return require('http').createServer(app);
			}
		})();
		const io = require('socket.io')(serv);
		
		serv.on('listening', ()=>{
			console.log(`Listening on ${serv.address().address}:${serv.address().port}`);
		});
		io.on('connection', _remoteConnected);
		
		////////////////////////////////////////////////////////////////////////////
		// Routing
		
		app.get('/fa', express.static(path.join(__dirname, 'site/fa/')));
		app.get('/api/:id', (req, res, next)=>{
			let i = Number.parseInt(res.params.id, 10);
			if (Number.isNaN(i)) return res.sendStatus(400);
			const opts = {
				root: path.join(__dirname, '../../memory/api'),
			};
			res.sendFile(`stream_api.${i}.json`, opts, (err)=>{
				if (err){
					console.error('Error sending API:', err);
					next(err);
				} else {
					console.trace(`Sent stream_api.${i}.json`);
				}
			});
		});
		
		app.use(express.static(path.join(__dirname, 'site'), {
			extensions: ['html'],
			index: 'index.html',
			fallthrough: false, // Last Middleware
		}));
		
		serv.listen(21231);
		this.server = serv;
		return;
		
		function _remoteConnected(sock) {
			console.log(`Remote connected.`);
			const evts = {};
			
			const { Pokemon } = require('../api/pokedata');
			const { MonLeveledUp, Blackout, BlackoutContext } = require('../newspress/ledger');
			const poke = new Pokemon();
			poke.loadFromMemory('eyJuYW1lIjoiVFRUVFNTU1NTUyIsInNwZWNpZXMiOiJNYWdpa2FycCIsIm5pY2tuYW1lZCI6dHJ1ZSwibmF0dXJlIjoiIiwiY2F1Z2h0SW4iOiIiLCJhYmlsaXR5IjoiIiwiaHAiOm51bGwsIm1vdmVzIjpbIlNwbGFzaCJdLCJtb3ZlSW5mbyI6W3siaWQiOjE1MCwibWF4X3BwIjo0MCwicHAiOjQwLCJuYW1lIjoiU3BsYXNoIiwidHlwZSI6Ik5vcm1hbCJ9XSwib3QiOnsiaWQiOjM0NDU2LCJuYW1lIjoiWFhXV05Oz4AifSwiZGV4aWQiOjEyOSwidHlwZXMiOlsiV2F0ZXIiXSwibGV2ZWwiOjUsIml0ZW0iOm51bGwsInN0b3JlZEluIjoiYm94OjEtMiIsInNoaW55IjpmYWxzZSwic3BhcmtseSI6ZmFsc2UsInNoYWRvdyI6ZmFsc2UsInBva2VydXMiOm51bGwsInRyYWRlZCI6ZmFsc2UsImNwIjoxNywiZml0bmVzcyI6MTMxOCwiaGFzaCI6MjY1NDYzNTYyMywiZ2FtZSI6MCwic3RhdHMiOnsiYXRrIjo2LCJkZWYiOjExLCJocCI6MTgsInNwbCI6OCwic3BlIjoxM319');
			
			const a = new MonLeveledUp(poke, 5);
			const b = new Blackout();
			const c = new BlackoutContext();
			
			sock.emit(`ledger`, 0,
`<state>
	<api>10</api>
	<modules>
		<mod name="Pokemon">
			<p>Hello world</p>
		</mod>
		<mod name="Item">
			<p>Items found!</p>
			<p>More Items found!</p>
		</mod>
	</modules>
	<rules>
		<rule name="This is a test rule">
			<match index="0">${a.toXml()}</match>
		</rule>
		<rule name="Blackouts spawn a BlackoutContext">
			<match index="0">${b.toXml()}</match>
			<match index="1">${c.toXml()}</match>
		</rule>
		<rule name="Echo BlackoutContext into the next ledger">
			<match index="0">${c.toXml()}</match>
		</rule>
	</rules>
	<ledger>
		${a.toXml()}
		${b.toXml()}
		${c.toXml()}
	</ledger>
	<postledger>
		${c.toXml()}
	</postledger>
	<typesetter></typesetter>
	<update>
		<p>This is a test!</p>
	</update>
</state>`
			);
			
			
			sock.on('disconnect', ()=>{
				console.log('Remote disconnected.')
			});
		}
	}
	
}

new WebServer().connect();