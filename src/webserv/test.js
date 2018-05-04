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
			
			const { Pokemon, SortedLocation } = require('../api/pokedata');
			const { MonLeveledUp, Blackout, BlackoutContext, LocationContext } = require('../newspress/ledger');
			
			const p1 = new MonLeveledUp(new Pokemon('eyJuYW1lIjoiVFRUVFNTU1NTUyIsInNwZWNpZXMiOiJNYWdpa2FycCIsIm5pY2tuYW1lZCI6dHJ1ZSwibmF0dXJlIjoiIiwiY2F1Z2h0SW4iOiIiLCJhYmlsaXR5IjoiIiwiaHAiOm51bGwsIm1vdmVzIjpbIlNwbGFzaCJdLCJtb3ZlSW5mbyI6W3siaWQiOjE1MCwibWF4X3BwIjo0MCwicHAiOjQwLCJuYW1lIjoiU3BsYXNoIiwidHlwZSI6Ik5vcm1hbCJ9XSwib3QiOnsiaWQiOjM0NDU2LCJuYW1lIjoiWFhXV05Oz4AifSwiZGV4aWQiOjEyOSwidHlwZXMiOlsiV2F0ZXIiXSwibGV2ZWwiOjUsIml0ZW0iOm51bGwsInN0b3JlZEluIjoiYm94OjEtMiIsInNoaW55IjpmYWxzZSwic3BhcmtseSI6ZmFsc2UsInNoYWRvdyI6ZmFsc2UsInBva2VydXMiOm51bGwsInRyYWRlZCI6ZmFsc2UsImNwIjoxNywiZml0bmVzcyI6MTMxOCwiaGFzaCI6MjY1NDYzNTYyMywiZ2FtZSI6MCwic3RhdHMiOnsiYXRrIjo2LCJkZWYiOjExLCJocCI6MTgsInNwbCI6OCwic3BlIjoxM319'), 4);
			const p2 = new MonLeveledUp(new Pokemon('eyJuYW1lIjoiKC0tIiwic3BlY2llcyI6IkJlbGxzcHJvdXQiLCJuaWNrbmFtZWQiOnRydWUsIm5hdHVyZSI6IiIsImNhdWdodEluIjoiIiwiYWJpbGl0eSI6IiIsImhwIjpudWxsLCJtb3ZlcyI6WyJWaW5lIFdoaXAiLCJHcm93dGgiLCJXcmFwIl0sIm1vdmVJbmZvIjpbeyJpZCI6MjIsIm1heF9wcCI6MTAsInBwIjoxMCwibmFtZSI6IlZpbmUgV2hpcCIsInR5cGUiOiJHcmFzcyJ9LHsiaWQiOjc0LCJtYXhfcHAiOjQwLCJwcCI6NDAsIm5hbWUiOiJHcm93dGgiLCJ0eXBlIjoiTm9ybWFsIn0seyJpZCI6MzUsIm1heF9wcCI6MjAsInBwIjoyMCwibmFtZSI6IldyYXAiLCJ0eXBlIjoiTm9ybWFsIn1dLCJvdCI6eyJpZCI6MzQ0NTYsIm5hbWUiOiJYWFdXTk7PgCJ9LCJkZXhpZCI6NjksInR5cGVzIjpbIkdyYXNzIiwiUG9pc29uIl0sImxldmVsIjoxMywiaXRlbSI6bnVsbCwic3RvcmVkSW4iOiJib3g6MS0xOSIsInNoaW55IjpmYWxzZSwic3BhcmtseSI6ZmFsc2UsInNoYWRvdyI6ZmFsc2UsInBva2VydXMiOm51bGwsInRyYWRlZCI6ZmFsc2UsImNwIjoyMTEsImZpdG5lc3MiOjEwMzUwLCJoYXNoIjo1NjUzNDc5NDMsImdhbWUiOjAsInN0YXRzIjp7ImF0ayI6MjUsImRlZiI6MTQsImhwIjozNywic3BsIjoyMywic3BlIjoxOH19'), 10);
			const p3 = new MonLeveledUp(new Pokemon('eyJuYW1lIjoiKC0tIiwic3BlY2llcyI6IkJlbGxzcHJvdXQiLCJuaWNrbmFtZWQiOnRydWUsIm5hdHVyZSI6IiIsImNhdWdodEluIjoiIiwiYWJpbGl0eSI6IiIsImhwIjpudWxsLCJtb3ZlcyI6WyJWaW5lIFdoaXAiLCJHcm93dGgiLCJXcmFwIl0sIm1vdmVJbmZvIjpbeyJpZCI6MjIsIm1heF9wcCI6MTAsInBwIjoxMCwibmFtZSI6IlZpbmUgV2hpcCIsInR5cGUiOiJHcmFzcyJ9LHsiaWQiOjc0LCJtYXhfcHAiOjQwLCJwcCI6NDAsIm5hbWUiOiJHcm93dGgiLCJ0eXBlIjoiTm9ybWFsIn0seyJpZCI6MzUsIm1heF9wcCI6MjAsInBwIjoyMCwibmFtZSI6IldyYXAiLCJ0eXBlIjoiTm9ybWFsIn1dLCJvdCI6eyJpZCI6MzQ0NTYsIm5hbWUiOiJYWFdXTk7PgCJ9LCJkZXhpZCI6NjksInR5cGVzIjpbIkdyYXNzIiwiUG9pc29uIl0sImxldmVsIjoxMywiaXRlbSI6bnVsbCwic3RvcmVkSW4iOiJib3g6MS0xOSIsInNoaW55IjpmYWxzZSwic3BhcmtseSI6ZmFsc2UsInNoYWRvdyI6ZmFsc2UsInBva2VydXMiOm51bGwsInRyYWRlZCI6ZmFsc2UsImNwIjoyMTEsImZpdG5lc3MiOjEwMzUwLCJoYXNoIjo1NjUzNDc5NDMsImdhbWUiOjAsInN0YXRzIjp7ImF0ayI6MjUsImRlZiI6MTQsImhwIjozNywic3BsIjoyMywic3BlIjoxOH19'), 7);
			const b = new Blackout();
			const c = new BlackoutContext();
			const d = new LocationContext(new SortedLocation({ areaName:'Route 22', mapId:20, x:30, y:4 }));
			
			sock.emit(`ledger`, 0,
`<state>
	<api>10</api>
	<modules>
		<mod name="ApiMonitoring"></mod>
		<mod name="Party"></mod>
		<mod name="Battle"></mod>
		<mod name="Chat"></mod>
		<mod name="Pokemon">
			<p>Hello world</p>
		</mod>
		<mod name="Politics"></mod>
		<mod name="Location"></mod>
		<mod name="Item">
			<p>Items found!</p>
			<p>More Items found!</p>
		</mod>
		<mod name="E4"></mod>
		<mod name="PC"></mod>
		<mod name="Timing"></mod>
		<mod name="RealTime"></mod>
		<mod name="Options"></mod>
	</modules>
	<preledger>
		<items>
			${d.toXml()}
			${b.toXml()}
			${c.toXml()}
			${p1.toXml()}
			${p2.toXml()}
		</items>
		<post>
			${p3.toXml()}
		</post>
	</preledger>
	<merges>
		<merge type="coalesced"><item>${p2.name}</item><item>${p3.name}</item></merge>
		<merge type="replaced"><item>${p2.name}</item><item>${p3.name}</item><item>${b.name}</item></merge>
		<merge type="removed"><item>${p2.name}</item><item>${p3.name}</item></merge>
	</merges>
	<rules>
		<rule name="This is a test rule">
			<match index="0">${p1.toXml()}${p1.toXml()}${p1.toXml()}</match>
		</rule>
		<rule name="Blackouts spawn a BlackoutContext">
			<match index="0">${b.toXml()}</match>
			<match index="1">${c.toXml()}</match>
		</rule>
		<rule name="Echo BlackoutContext into the next ledger">
			<match index="0">${c.toXml()}</match>
		</rule>
		<rule name="This is a rule with an unorthodox match">
			<match index="0">${p2.toXml()}</match>
			<matchObj index="1">${new Map([['hello','world']])}</matchObj>
		</rule>
	</rules>
	<postledger>
		<items>
			${d.toXml()}
			${b.toXml()}
			${c.toXml()}
			${p1.toXml()}
			${p2.toXml()}
		</items>
		<post>
			${c.canPostpone().toXml()}
		</post>
	</postledger>
	<typesetter>
		<item>
			<in num="2" flavor="default">${p1.name}</in>
			<format> &lt;b&gt;{{@target}} has grown to level {{@level}}!&lt;/b&gt;</format>
			<format> &lt;b&gt;{{@target}} is now level {{@level}}!&lt;/b&gt;</format>
			<out> &lt;b&gt;Magikarp has grown to level 5!&lt;/b&gt; &lt;b&gt;Pokemon is now level 20!&lt;/b&gt;</out>
		</item>
	</typesetter>
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