all: kafka

kafka:
	bin/kafka-topics.sh --create --topic input --bootstrap-server localhost:9092
	bin/kafka-topics.sh --create --topic output --bootstrap-server localhost:9092

clean:
	bin/kafka-topics.sh --delete --topic input --bootstrap-server localhost:9092
	bin/kafka-topics.sh --delete --topic output --bootstrap-server localhost:9092
	rm -rf ../checkpoint
	mkdir ../checkpoint
