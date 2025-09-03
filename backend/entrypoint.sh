#!/bin/bash
echo "Waiting for MySQL to be ready..."
until nc -z mysql 3306; do
  sleep 1
done
echo "MySQL is up - starting Spring Boot"
exec java $JAVA_OPTS -jar target/demo-0.0.1-SNAPSHOT.jar
