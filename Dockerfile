# Use Java 21 base image because pom.xml specifies <java.version>21</java.version>
FROM eclipse-temurin:21-jdk-alpine

# Set working directory
WORKDIR /app

# Copy the built jar file
# Matching any jar with version suffix
COPY target/ghostlink-*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
