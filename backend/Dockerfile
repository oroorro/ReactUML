FROM openjdk:17-jdk-slim

# Set base working directory
WORKDIR /app

# Copy frontend build into static resources
COPY frontend/dist backend/demo/src/main/resources/static

# Copy backend project
COPY backend/demo backend/demo

# Copy entrypoint script
COPY backend/entrypoint.sh backend/entrypoint.sh

# Make sure entrypoint script is executable
RUN chmod +x backend/entrypoint.sh

# Install netcat here
RUN apt-get update && apt-get install -y netcat && rm -rf /var/lib/apt/lists/*

# Go into backend app folder
WORKDIR /app/backend/demo

# Build the Spring Boot app
RUN ./mvnw clean package -DskipTests

# Use entrypoint script to run the app
ENTRYPOINT ["../entrypoint.sh"]

# Run the built app
#CMD ["java", "-jar", "target/demo-0.0.1-SNAPSHOT.jar"]
