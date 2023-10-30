# Performancer and AnnoXplorer
This repository contains the code for the Performancer and AnnoXplorer tools that are part of the Interactive Text Mining Environment of the EU-Project InTaVia. See public Deliverable 4.7 for a detailed description of the tools.

The prototype consists of a JavaScript frontend and a Flask backend. To run it locally, an installation of Node.js, npm, and Python (version 3.10 or greater) is required.

The Performancer interface is the entry point into the application to allows for distant reading and comparison of annotated text corpora and NLP pipelines. When a number of data points in one of the charts is brushed, the AnnoXplorer interface is opened in a new tab, giving the possibility for close reading and detailed analysis of the brushed annotations and texts.

The first step of building and running the prototype is installing all necessary npm and pip packages for the project. To build the frontend, navigate to the _./frontend/static_ directory with a terminal or command line tool.

- To install the npm packages for the frontend, run the following command:
  `npm install`
   
- After the successful installation, build the frontend application by running the following command:
  
  `npm run build`

- To install all necessary pip packages for the backend and start a Flask development server, navigate to the ./backend folder and run the following command:
  
  `pip install -r requirements.txt`
  
- Next, to generate the test data for the prototype, navigate to the ./backend/preprocessing folder and run the following two commands:
  
  `py preprocessing.py doc`
  
  `py preprocessing.py sent`
  
- Finally, to run the prototype navigate to the ./backend folder and start a Flask development server with the following command:
  
  `flask run`

While the development server is running, the application can be accessed locally at _localhost:5000_. 
