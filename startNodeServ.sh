#!/bin/bash
ps -eaf | grep dblessNodeServ | grep node | cut -d' ' -f2 | xargs kill -9
nohup node nodeserv/dblessNodeServ.js >>nodeserv/dblessNodeServ.log 2>&1 &
