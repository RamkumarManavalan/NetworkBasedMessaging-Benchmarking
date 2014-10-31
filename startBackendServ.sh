#!/bin/bash
pid=`ps -eaf | grep dblessBackendServ | grep node | awk '{ print $2 }'`
if [ -n $pid ]; then
  kill -9 $pid
fi
cd backendserv
nohup node dblessBackendServ.js >> dblessBackendServ.log 2>&1 &
cd ..
