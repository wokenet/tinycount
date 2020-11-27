# tinycount

The simplest possible "live viewers" counter: an HTTP server you poll on an interval to register your presence and obtain the current viewer count.

## Options

Two options are accepted via environment variable:

`PORT`: Specify the port the http server will listen on.  
`INTERVAL_SECS`: The interval (in seconds) between client polls.  
`ALLOWED_ORIGINS`: Origin header values that views will be accepted from.

## API

Each client should generate a random string to be used as its identifier (to dedupe multiple browser tabs open).

`POST /<IDENTIFIER>`: Responds with the current number of viewers in plaintext. The `Cache-Control: max-age=SECS` header will be present, where `SECS` is the number of seconds the client should wait before the next poll.

Clients are given a grace period of half the configured interval after their expected check-in before being considered inactive.

Identifiers must not be shorter than 8 characters or over 32 characters long. Any other request method than POST is rejected.

## Scaling next steps

This implementation is intentionally trivial, and has obvious scaling limitations. When one process is no longer enough, I would suggest adding a redis server for coordination, running multiple tinycount processes behind a load balancer. On the configured interval, each process should write its total to the redis and fetch all of the other totals.
