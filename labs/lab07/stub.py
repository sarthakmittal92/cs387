from pyspark.sql import SparkSession
from pyspark.sql.types import *
from pyspark.sql.functions import *
from pyspark.sql.window import Window
from kafka import KafkaProducer
import csv
import threading
import time
import sys
spark = (
	SparkSession.builder.appName("Kafka Pyspark Streaming")
	.master("local[*]")
	.getOrCreate()
)
spark.sparkContext.setLogLevel("ERROR")
KAFKA_TOPIC_NAME = "input"
KAFKA_BOOTSTRAP_SERVER = "localhost:9092"

class thread(threading.Thread):
	def __init__(self):
		threading.Thread.__init__(self)
	def run(self):
		time.sleep(25)
		print("Producing messages")
		producer = KafkaProducer(bootstrap_servers=[KAFKA_BOOTSTRAP_SERVER])
		with open('data.csv', 'r') as file:
			reader = csv.reader(file)
			for row in reader:
				message = ','.join(row).encode('utf-8')
				producer.send('input', message)
		producer.close()

if __name__ == "__main__":

	sampleDataframe = (
        spark.readStream.format("kafka")
        .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVER)
        .option("subscribe", KAFKA_TOPIC_NAME)
        .option("startingOffsets", "latest")
        .load()
    )
	t = thread()
	query = sampleDataframe.selectExpr("CAST(value AS STRING)")
	query = query.select(split('value', ',').alias('value'))
	output = query.select(*[query['value'][i] for i in range(4)])
	output = output.withColumnRenamed("value[0]", "value0")\
	.withColumnRenamed("value[1]", "value1")\
	.withColumnRenamed("value[2]", "value2")\
	.withColumnRenamed("value[3]", "value3")
	output = output.withColumn('timestamp', unix_timestamp(col('value3'), "d MMMM yyyy").cast(TimestampType()))
	output = output.selectExpr("value1 as movieId", "value0 as user", "cast(value2 as int) as rating", 'value3', 'timestamp', 'day(timestamp) as day', 'month(timestamp) as month', 'year(timestamp) as year')

	# Query 1
	if(sys.argv[1] == "q1"):
		# Write query here
		t.start()
		# Write the query output to Kafka topic 'output' with waiting time of termination being 120 seconds
		t.join()

	# Query2
	if(sys.argv[1] == "q2"):
		# Write query here
		t.start()
		# Write the query output to Kafka topic 'output' with waiting time of termination being 120 seconds
		t.join()


	# Query 3
	if(sys.argv[1] == "q3"):
		# Write query here
		t.start()
		# Write the query output to Kafka topic 'output' with waiting time of termination being 120 seconds
		t.join()

	# Query 4
	if(sys.argv[1] == "q4"):
		# Write query here
		t.start()
		# Write the query output to Kafka topic 'output' with waiting time of termination being 120 seconds
		t.join()



