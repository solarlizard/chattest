# Prerequirements
- docker
- docker-compose

# Launch

- ````./start.sh```` or ````docker-compose up --build````

goto http://localhost:8080 after everything is started

### No need to do yarn or npm install

# Functions

- Press "Seed" button to generate 100 messages
- Scroll to top to load next page of messages
- Remove cursor from chat board to return to last messages

# Out of scope

- I redesigned code from lerna way to two projects, like they are in different repositories. I beleive it is not a good idea to do two jobs in one time (coding server and client, checking server using clinet). I prefer to build server and cover it with tests to be sure that I can build client without thinkig of server problems.
- I removed schema validation, because I suppose that both client and server should use api models and validation generated from some OpenAPI or Protobuf schemas. Usually I am using my own code generators, and they generates not only models, but controller interfaces, clients and valiadators. 
- Code in "generated" folders - are the code, that shuld be generated as I mentioned above


# CI

Repository is building and testing with Github Actions https://github.com/solarlizard/chattest/actions

# Server

- Server implements Repository pattern where code is separated using several layers of abstraction with different API:
````
RequestHandler --> Controller --> Logic --> Service --> Dao
````

where:

<b>RequestHandler layer</b> - is responsible for logging, catching errors, schema valiation

<b>Controller layer<b> - is responsible for logic validation, preparing calls to Logic layer and building responses

<b>Logic layer<b> - is responsible for main logic

<b>Service layer<b> - is responsible for accessing DAO to hide database structure from logic
  
<b>Dao layer<b> - working with database

- Server is covered with tests:
````
=============================== Coverage summary ===============================
Statements   : 100% ( 277/277 )
Branches     : 100% ( 49/49 )
Functions    : 100% ( 84/84 )
Lines        : 100% ( 235/235 )
================================================================================
````

# Client
- As I mentioned during interview - I am not a front-end developer, so I am sure that I missed some modern tehcnics.
- In real life building eternity scrolling for messages list is complicated task, so I provided only one part of it - loading pages of messages with scrolling to top
- In
