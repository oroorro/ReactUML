#!/bin/bash

# Get current date and time in desired format
timestamp=$(date +"%m-%d-%H:%M")

# Define output log file
logfile="${timestamp}Errlog.txt"

# Run Maven command and redirect both stdout and stderr to the file
./mvnw clean test > ./log/"$logfile"
#./mvnw clean test > "$logfile" 2>&1

