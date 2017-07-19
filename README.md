# IOBeez

## Description
**This is a sample project to demonstrate various technologies: NodeJS, socket.io, handebars, express, postgresql, etc...**

Our customers are home-owners that deploy various sensors in their homes to monitor their environment. These sensors include electricity consumption monitors, temperature sensors, motion detectors, and smoke detectors. The sensors are reading and transmitting one type of data through the home's wifi network, in intervals of 1 second up to 1 minute. E.g. the electricity consumption sensors are sending data every second, the CO2 every minute, the rest every 30 seconds.

The users can view their sensor readings in real-time/live on a web based dashboard. Besides the raw values, the users also expect to see the latest 15-minute and 60-minute averages. They would also like to have access to historical data.

## Overview

### Database
For this project, I based the database system around the concept of "Views". Read more on postgreSQL "Views" [here](http://www.postgresqltutorial.com/managing-postgresql-views/).

_Note: postgresql server has support for scrubbing query values with parameratized queries. In light of this, the application does not scrub any queries before sending to the sql server._

#### View
In short, utilizing a "View" for this project allowed me to create a properly normalized database while at the same time allowing any application interacting with the database to use simple queries (i.e. not worry about the ramifications of the normalization in terms of query/database complexity).

I created a diagram to highlight these benefits. You can see in the image below that incoming queries are made only against the View. The database view logic combined with the trigger procedure allows reads and insertions directly from the view without having to worry about the underlying tables and their constraints.

![iobeez sql diagram](https://user-images.githubusercontent.com/2591298/28387800-727b1734-6c9e-11e7-9795-c611fde9a53f.png)


### DevOps / Development
Below are instructions for configuring the application and getting it up and running.

#### Application Parameters
_note: All of these support environment variables and command line overrides. I recommend you set up permanent environment variables on your machine / server._

|     Variable    	|                                   Required                                  	|
|:---------------	|:---------------------------------------------------------------------------	|
| IOBEEZ_WEB_PORT 	| Web port you would like the server to run on (currently only supports http) 	|
| PGUSER          	| Username for logging into your postgresql database server                   	|
| PGHOST          	| Host for logging into your postgresql database server                       	|
| PGPASSWORD      	| Password for logging into your postgresql database server                   	|
| PGPORT          	| Port for logging into your postgresql database server                       	|
| PGDATABASE      	| Database name for logging into your postgresql database server              	|

#### Application Set Up
1. Get postgresql set up on a server and execute the schema in /lib/database/schema.sql. This will set up the database for the application. Store relevant sql details in the environment variables listed above.
2. To start the web application, you'll need to run `npm install` and then `npm list` to ensure all modules were loaded properly.
3. With your environment variables set and node modules installed, you simply need to start the server `node app.js`
4. Enjoy !

### API
This server has a **RESTful** API component. Users can POST/GET to `/api/logs` to either submit log data or retrieve all log data.

POST data for `/api/logs`
```
{
  account_name: 'Account Name',
  value: 1,
  sensor_name: 'Sensor Name'
}
```

_Note: account_name and sensor_name need to match what is in the database (case sensitive) !_

GET response for `/api/logs`
```
{
  "sensor_data": {
    "temperature": [{
      "timestamp": "2017-07-16T18:30:54.612Z",
      "value": 3,
      "account_name": "Nate"
    }, {
      "timestamp": "2017-07-16T18:30:54.612Z",
      "value": 3,
      "account_name": "Nate"
    }],
    "electric": [{
      "timestamp": "2017-07-16T18:30:54.612Z",
      "value": 3,
      "account_name": "Locke"
    }, {
      "timestamp": "2017-07-16T18:30:54.612Z",
      "value": 3,
      "account_name": "Anthony"
    }],
    "motion": [{
      "timestamp": "2017-07-16T18:30:54.612Z",
      "value": 3,
      "account_name": "Locke"
    }, {
      "timestamp": "2017-07-16T18:30:54.612Z",
      "value": 3,
      "account_name": "Joey"
    }],
    "smoke": [{
      "timestamp": "2017-07-16T18:30:54.612Z",
      "value": 3,
      "account_name": "Joey"
    }, {
      "timestamp": "2017-07-16T18:30:54.612Z",
      "value": 3,
      "account_name": "Nate"
    }]
  }
}
```


### Requirements
- Multiple users
- View sensor reading in real time / live on web dashboard
- Users can also view latest 15 and 60 minute averages
- Users can also view historical data
- Include deployment scripts / instructions

### Assumptions
- Data will just be random ints
- Authentication details will be abstracted away
- Views / styling will be basic
- Not worrying about HTTPS
- Not updating averages when live data comes in, marked in code comments as TODO - ENHANCEMENT
- Live updates only occur on the dashboard, not the `/history` routes

## Next Steps
- Implement the enhancements scattered in the code comments as `TODO - ENHANCEMENTS`
- Make the views / styling production quality (i.e. way better than what I currently have)
- Focus on concurrency / production level traffic by running siege or something similar on the web server and consequently the database server
- Tie up any loose security ends and add support for HTTPS

## Testing

### Multiple users
- `/login` to log in to an account. All you need is the name of the account stored in the DB.
- `/logout` resets session cookies and logs user out

### Sensor Readings
- `/dashboard` shows all 4 sensors and the corresponding data along with averages
- clicking the links to 'History' on the dashboard will take users to the corresponding `/history/:sensor_name` routes which show only that sensors data
- To test live updates:
  - login as a user and view `/dashboard`
  - follow instructions under the **API** section above for POSTing log data
  - you should see user specific updates occur on the dashboard

### API
- `/api/logs` will return all logs in the database in JSON format
- see **API** section above for more details
