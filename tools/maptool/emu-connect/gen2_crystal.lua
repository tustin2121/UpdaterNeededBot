-- maptool emu-connect/gen2_gold.lua
-- A Bizhawk lua script that connects to the maptool for map information

local hudEndpoint = "http://127.0.0.1:21345/"

if http == nil then
	http = require("socket.http")
	http.TIMEOUT = 0.01
end
JSON = (loadfile "JSON.lua")()


function sendMapData()
	local data = {};
	memory.usememorydomain('WRAM')
	data["x"] = memory.readbyte(0x1CB8);
	data["y"] = memory.readbyte(0x1CB7);
	data["map_bank"] =  memory.readbyte(0x1CB5);
	data["map_id"] = memory.readbyte(0x1CB6);
	data["area_id"] = memory.readbyte(0x02D9);
	
	--print("sendData", data);
	http.request(hudEndpoint, JSON:encode(data));
end

function sendData(frame)
	if frame and frame % 20 == 0 then --once every 20 frames
		sendMapData();
	end
end

while true do
	emu.frameadvance();
	sendData(emu.framecount());
end
