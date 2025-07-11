
# This script make sures we have react app before running backend application which copies from react app in frontend/dist

echo "🔧 Building frontend (React)..."
cd frontend || { echo "Cannot enter frontend folder"; exit 1; }

npm install
npm run build
if [ $? -ne 0 ]; then
  echo "React build failed. Aborting."
  exit 1
fi

cd ..

echo "Building and starting Docker containers..."
docker compose -f docker-compose.yml -f docker-compose.test.yml up --build

