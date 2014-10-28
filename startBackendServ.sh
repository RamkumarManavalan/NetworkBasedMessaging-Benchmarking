#!/bin/bash
ps -eaf | grep dblessBackendServ | grep node | awk '{ print $2 }' | xargs kill -9
cd backendserv
nohup node dblessBackendServ.js >> dblessBackendServ.log 2>&1 &
cd ..
