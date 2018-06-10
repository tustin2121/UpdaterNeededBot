#!/usr/bin/env bash

echo Starting UpdaterNeededBot Loop.
while [ true ]; do
	node .
	read -p "UpdaterNeeded has stopped. Rebooting in 3 seconds..." -t 3
done
