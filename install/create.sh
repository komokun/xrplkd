#!/bin/sh

sed -e "s;%WORKING_DIR%;$1;g" -e "s;%YARN%;$2;g" -e "s;%DIR%;$3;g" service.template > xrplkd.service

sudo cp xrplkd.service /etc/systemd/system

sudo systemctl enable xrplkd.service 

sudo systemctl start xrplkd.service