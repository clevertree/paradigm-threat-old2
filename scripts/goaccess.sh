#!/bin/sh

# cd /var/log/nginx || exit

pkill goaccess
sleep 1
/bin/zcat /var/log/nginx/access.log.*.gz \
| goaccess \
-o ../files/site/report.html \
-o ../files/site/report.json \
--real-time-html \
--ignore-crawlers --log-format=COMBINED /var/log/nginx/access.log -
