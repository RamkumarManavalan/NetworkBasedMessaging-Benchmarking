#!/bin/bash
ps -eaf | grep dblessBackendServ | grep node | cut -d' ' -f2 | xargs kill -9
nohup node backendserv/dblessBackendServ.js >>backendserv/dblessBackendServ.log 2>&1 &
