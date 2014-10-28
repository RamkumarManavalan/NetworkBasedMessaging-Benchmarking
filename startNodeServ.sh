#!/bin/bash
ps -ef | grep dblessNodeServ | grep -v grep | awk '{ print $2 }'| xargs kill -9
cd nodeserv
nohup node dblessNodeServ.js >> dblessNodeServ.log 2>&1 &
cd ..
