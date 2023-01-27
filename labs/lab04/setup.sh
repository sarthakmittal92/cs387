#!/bin/bash

sudo apt update
sudo apt install nodejs
nodejs -v
sudo apt install npm
sudo npm install -g npm
mkdir IITASC && cd IITASC
npm init
npm -v