cd ../front
npm i
npm run build
cd ../backend
cp -r ../front/dist/* ./nginx/frontend-build/
