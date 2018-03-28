-- maptool emu-connect/gen4.5.lua
-- The DeSuMe lua script that connects to the maptool for map information

function sendMapData()
	local data = {};
	data["x"] = 0;
	data["y"] = 0;
	data["map_bank"] = 0;
	data["map_id"] = memory.readword(0x02282B50);
	data["area_id"] = 0;
	data["matrix"] = 0;
	data["parent"] = 0;
	data["id"] = 0;
end

function sendData(frame)
	if frame and frame % 20 == 0 then --once every 20 seconds
		sendMapData();
	end
end

while true do
	emu.frameadvance();
	sendData(emu.framecount());
end