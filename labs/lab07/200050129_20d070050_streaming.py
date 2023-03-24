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
		# time.sleep(25)
		print("Producing messages")
		producer = KafkaProducer(bootstrap_servers=[KAFKA_BOOTSTRAP_SERVER])
		with open('data2.csv', 'r') as file:
			reader = csv.reader(file)
			for row in reader:
				message = ','.join(row).encode('utf-8')
				producer.send('input', message)
		producer.close()
		print('Done..')

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
		output1 = output.select("movieId", "year", "month", "rating").where("rating is not null").groupBy(["movieId", "year", "month"]).agg({"rating":"avg"}).withColumnRenamed("avg(rating)","avg_rating")
		t.start()
		output1.selectExpr("'null' as key", "CONCAT(CAST(movieId AS STRING),\",\", CAST(year as STRING),\",\", CAST(month as STRING),\",\", CAST(avg_rating as STRING)) as value") \
	    .writeStream \
	    .format("kafka") \
	    .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVER) \
	    .option("topic", "output") \
	    .option("checkpointLocation", "./checkpoint") \
	    .outputMode("complete") \
	    .start().awaitTermination(120)
		t.join()

	# Query2
	if(sys.argv[1] == "q2"):
		# Write query here
		output2 = output# output1.writeStream.format("console").start()
		t.start()
		output2.selectExpr("'null' as key", "CONCAT(CAST(user AS STRING),\",\", CAST(year as STRING),\",\", CAST(month as STRING)) as value") \
	    .writeStream \
	    .format("kafka") \
	    .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVER) \
	    .option("topic", "output") \
	    .option("checkpointLocation", "./checkpoint") \
	    .outputMode("complete") \
	    .start().awaitTermination(120)
		t.join()


	# Query 3
	if(sys.argv[1] == "q3"):
		# Write query here
		output3 = output
		t.start()
		output3.selectExpr("'null' as key", "CONCAT(CAST(user AS STRING),\",\", CAST(year as STRING),\",\", CAST(month as STRING),\",\", CAST(avg_rating as STRING)) as value") \
	    .writeStream \
	    .format("kafka") \
	    .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVER) \
	    .option("topic", "output") \
	    .option("checkpointLocation", "./checkpoint") \
	    .outputMode("complete") \
	    .start().awaitTermination(120)
		t.join()

	# Query 4
	if(sys.argv[1] == "q4"):
		# Write query here
		output4 = output
		t.start()
		output4.selectExpr("'null' as key", "CONCAT(CAST(movieId AS STRING),\",\", CAST(day as STRING),\",\", CAST(month as STRING),\",\", CAST(year as STRING)) as value") \
	    .writeStream \
	    .format("kafka") \
	    .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVER) \
	    .option("topic", "output") \
	    .option("checkpointLocation", "./checkpoint") \
	    .outputMode("complete") \
	    .start().awaitTermination(120)
		t.join()
