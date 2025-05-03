FROM openjdk:17-jdk-slim

# Set base working directory
WORKDIR /app

# Copy frontend build into static resources
COPY frontend/dist backend/demo/src/main/resources/static

# Copy backend project
COPY backend/demo backend/demo

# Go into backend app folder
WORKDIR /app/backend/demo

# Build the Spring Boot app
RUN ./mvnw clean package -DskipTests

# Run the built app
CMD ["java", "-jar", "target/demo-0.0.1-SNAPSHOT.jar"]
