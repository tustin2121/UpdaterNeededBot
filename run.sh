#!/usr/bin/env bash

RUN_START=1560027600
RUN_CONFIG="s603-randocolo"

echo Starting UpdaterNeededBot Loop.
while [ true ]; do
	node . $RUN_START $RUN_CONFIG
	read -p "UpdaterNeeded has stopped. Rebooting in 3 seconds..." -t 3
done
