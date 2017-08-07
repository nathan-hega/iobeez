# Design Decisions

## NodeJS
- async. non-blocking IO to help it scale
-- most web servers have a new thread for each request which makes memory an issue and also could cause waiting. NodeJS has one thread and an event loop it uses to handle servicing many requests on a single thread
-- Heavy computation chokes up NodeJS and clogs the event loop
- compiles directly to machine code making it really fast
- NPM / open source


## Database
1. Make interactions with the database as simple as possible. Applications engaging with the database shouldn't need to know the lower level details of the schema.
2. Make sure the database is properly normalized.
3. Make the database as dynamic as possible. Inserting a new sensor or account happens naturally as new sensors report data. There is no manual insertion process for new items.
4. Centralize average calculations to the database rather than having applications replicate the logic elsewhere.
5. Proper use of functions and triggers


## RESTful API
I chose to implement sensor data submission in the web app in order to implement the live update feature. I decided to try and implement some restful ideas to the implementation because it made sense and is relevant.

I was going to expand it by changing the data I returned based on header values but didn't have time.

## Minor
- Implementing a central access to the database pool to ensure only one pool is created and also centralizing an entry point for logging or other purposes.
- Proper use of middleware helper functions that reduce the code duplication.
- Closure.
- Async.parallel
- Error handling
- Event emitters
- Handlerbars partials
- Shrinkwrap file
- Using config values to handle the average time calculations (incomplete but the point is there)