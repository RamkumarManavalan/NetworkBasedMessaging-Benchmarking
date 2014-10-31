#!/bin/bash
#'USAGE: sh t.sh <num requests> <sleep between requests in seconds> <delayby in seconds>'
#'Example (make 1000 requests, sleep 1 millisecond): sh t.sh 1000 0.001 25'

max=$1
sleeptime=$2
delayby=$3
ts=`date +"%s"`
waituntil=`expr $delayby + $ts`

initialdocs=`mongo dblessDB --quiet --eval "printjson(db.user.find().count())"`
mongo dblessDB --quiet --eval "printjson(db.user.remove({}))" | grep -v undefined 

a=0
START=$(date +%s)
while [ $a -lt $max ]
do
  a=`expr $a + 1`
  data='{"user":{"name":"Ram Spray", "age":10, "loopcount":0, "retrycount":0}, "endpoint":{"host":"10.9.216.220", "port":7080, "path":"/user"}, "waituntil":'$waituntil'}'
  curl -s -X POST -H "Content-Type: application/json" -d "$data" http://10.9.216.220:6001/waituntil | grep -v  endpoint
  if [ $sleeptime -gt 0 ]; then
    sleep $sleeptime
  fi
done
END=$(date +%s)

diff=$(($END-$START))

sleep $(($delayby + 5))
docs=`mongo dblessDB --quiet --eval "printjson(db.user.find().count())"`


echo "SUMMARY#"$sleeptime"#"$delayby"#"$max"#"$docs"#"$initialdocs
#echo "SUMMARY#"$sleeptime"#"$delayby"#"$max"#"$(($max/$diff))"#"$docs"#"$initialdocs

