#!/bin/bash

spark-submit --packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.3.2 200050129_20d070050_streaming.py $1
