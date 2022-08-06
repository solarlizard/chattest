# Prerequirement
- docker
- docker-compose

# Launch

- ````./start.sh```` or ````docker-compose up --build````

goto http://localhost:8080 after everything is started

# Functions

- Press "Seed" button to generate 100 messages
- Scroll to top to load next page of messages
- Remove cursor from chat board to return to last messages

# Out of scope

- I separted code from learna to two projects like they are in different repositories. I beleive it is not good idea to do two jobs in one time (coding server and client, checking server using clinet). I prefer to build server and cover it with tests to be sure that I can build client without thinkig of server problems.
- I removed schema validation, because I suppose that both client and server shuold use api models and validation generated from some OpenAPI or Protobuf schemas. Usually I am using my own code generators, and they generates not only models, but controller interfaces, clients and valiadators.
