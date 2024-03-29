#!/bin/sh

sed -e "s;%WORKING_DIR%;$1;g" -e "s;%YARN%;$2;g" -e "s;%DIR%;$3;g" service.template > xrplkd.service

cd $1

sudo $2 build 

cd $1/install

sudo cp xrplkd.service /etc/systemd/system

sudo rm xrplkd.service

sudo systemctl enable xrplkd.service 

sudo systemctl start xrplkd.service