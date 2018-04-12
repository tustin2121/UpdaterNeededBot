-- maptool emu-connect/gen4.5.lua
-- A DeSmuME lua script that connects to the maptool for map information

local hudEndpoint = "http://127.0.0.1:21345/"
-- local OFFSET = 0x0227D4B8;
local OFFSET = 0x0227D504;

if http == nil then
	http = require("socket.http")
	http.TIMEOUT = 0.01
end
JSON = (loadfile "JSON.lua")()


function sendMapData()
	local data = {};
	data["x"] = memory.readword(OFFSET + 0x8);
	data["y"] = memory.readword(OFFSET + 0xC);
	data["map_bank"] = 0;
	data["map_id"] = memory.readword(OFFSET + 0x0);
	data["area_id"] = 0;
	
	print("sendData", data);
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

-- No, there's no fucking documentation for DeSmuME's lua, because it's shit and the developers
-- actively hate Pokemon to the point of sabotaging emulation accuracy to make it work worse.
-- So here's the most "documentation" we're going to get:
-- https://github.com/encukou/desmume/blob/master/desmume/src/lua-engine.cpp