# CommonsHood Backend Repository
This repository contains the server side implementation of the CommonsHood dapp. We use Strongloop Loopback as RESTful API framework.

## Repository Structure
The two main folders of the project are `common` and `server`. Inside the `common` folder there are the models shared between the frontend and backend implementations of the web app. In the `server` one, instead, inside the `models` folder there are the models used only by the backend implementation.
Inside the `server/boot` folder are placed the scripts that runs at server boot time.

## Configuration
`server/config.json` contains the server configuration parameters. `server/datasources.json` contains the server datasource configuration parameters. `server/model-config.json` contains the models configuration parameters like the datasources of the model, or wich API endpoint should be exposed by the server.

## Starting the server
*PLEASE BE CAREFUL: Be sure that a mongodb instance is running before attempting to start the server*

To start the server open the terminal inside the cocity-backend folder and write this command:

``` bash
node .
```
This repository contains the back end code of the cocity project

#### Technologies
- Loopback
- Nodejs

---

#### Show Documentation

Install `jsdoc` first:

``` sh
$ npm i -g jsdoc
```

Then run it on the `client`, `server`, `common` and `extra-docs` directories in `recursive mode`:
``` sh
$ cd /path/to/project/root
$ jsdoc -r server client common extra-docs
```

Finally open `out/index.html` with a web browser to see the built website
