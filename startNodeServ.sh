#!/bin/bash
pid=`ps -ef | grep dblessNodeServ | grep -v grep | awk '{ print $2 }'`
echo $pid
if [ -n $pid ]; then
  kill -9 $pid
fi
cd nodeserv
nohup node dblessNodeServ.js >> dblessNodeServ.log 2>&1 &
cd ..
