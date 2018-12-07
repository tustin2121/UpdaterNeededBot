-- maptool emu-connect/gen3_emerald.lua
-- A VBA-RR lua script that connects to the maptool for map information

local hudEndpoint = "http://127.0.0.1:21345/"

if http == nil then
	http = require("socket.http")
	http.TIMEOUT = 0.01
end
JSON = (loadfile "JSON.lua")()


function sendMapData()
	local data = {};
	data["x"] = memory.readbyte(0x03005E5C);
	data["y"] = memory.readbyte(0x03005E5E);
	data["map_bank"] =  memory.readshort(0x03005E59);
	data["map_id"] = memory.readshort(0x03005E58);
	data["area_id"] = 0;
	
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
