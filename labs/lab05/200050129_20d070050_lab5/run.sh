#!/bin/bash

rm -rf datadir/*
cp -r kaggle/$1/* datadir
python3 200050129_20d070050_lab5.py --n 3 --k 3