#!/usr/bin/env bash

RUN_START=1553992971
RUN_CONFIG="s602a-metronomesapphire"

echo Starting UpdaterNeededBot Loop.
while [ true ]; do
	node . $RUN_START $RUN_CONFIG
	read -p "UpdaterNeeded has stopped. Rebooting in 3 seconds..." -t 3
done
