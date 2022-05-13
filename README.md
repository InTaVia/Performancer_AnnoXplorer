# Performancer and AnnoXplorer

## setup
- install node modules via npm (package.json): in ./frontend/static: npm install
- install python packages via pip-tools  (requirements.in):
    - install pip-tools
    - in ./backend: pip-compile, pip-sync
- generate test data in ./backend/preprocessing: 
    - py preprocessing.py doc
    - py preprocessing.py sent
- run webpack: in ./frontend/static: npm run build
- run flask server (./backend/app.py)
- brushing on bars in Performancer opens AnnoXplorer with the selected texts

## documentation
see deliverable 4.2
