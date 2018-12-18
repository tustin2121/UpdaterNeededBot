#!/usr/bin/env bash

RUN_START=1544302800
RUN_CONFIG="s506-randofuser"

echo Starting UpdaterNeededBot Loop.
while [ true ]; do
	node . $RUN_START $RUN_CONFIG
	read -p "UpdaterNeeded has stopped. Rebooting in 3 seconds..." -t 3
done
