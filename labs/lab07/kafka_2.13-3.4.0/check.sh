#!/bin/bash

bin/kafka-console-consumer.sh --topic output --from-beginning --bootstrap-server localhost:9092
