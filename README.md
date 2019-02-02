# KettleSkill

## This is a project which allows me to boil water using Amazon Echo (and a kettle of course)

## What you'll need to achieve the same:

- basic electric kettle. The crucial thing about it is that it needs to automatically deactive once the water has reached boiling point, but most of modern kettles already has such functionality
- AWS account
- [TP-LINK HS110 smart plug](https://www.kasasmart.com/us/products/smart-plugs/kasa-smart-plug-energy-monitoring-hs110)
- Amazon Echo

## Pre-install

- get an account on [TP-LINK cloud](https://www.tplinkcloud.com/)
- name your Smart Plug, e.g. Kettle
- set your Smart Plug so it can be controlled over the Internet (Remote Control set to enabled)
- install [serverless cli](https://serverless.com/framework/docs/getting-started/)

## Install

1. git clone repo
2. Then it's a classic serverless workflow:

    2a. Run `sls alexa auth` to authenticate
    
    2b. Run `sls alexa create --name KettleSkill --locale en-US --type custom` to create a new skill
    
    2c. Paste the skill id returned by the create command to `serverless.yml:30`
    
    2d. Do your first deploy of your Serverless stack with `TPLINK_LOGIN=<login> TPLINK_PASSWORD=<password> SMART_PLUG_ALIAS=<alias> sls deploy`
    
    2e. Paste the ARN of your lambda to `serverless.yml:39`
    
    2f. Run `sls alexa update` to deploy the skill manifest
    
    2g. Run `sls alexa build` to build the skill interaction model
    
    2h. Enable the skill in the Alexa app to start using it.
    
 3. You might need to enable reminders for the KettleSkill in the Alexa app so you can get feedback once the water has boiled
 
## Use it
1. Fill the kettle with water.
2. Turn off the Smart Plug and turn on the kettle.
3. Say to Amazon Echo - "Alexa, boil water"
4. You should get a response "Boiling the water now"
5. After a while if you enabled reminders you should get a reminder saying "The water has boiled. Go and make a nice cuppa tea."
6. Make a nice cuppa ☕

## How it works
The KettleSkill triggers a lambda function which turns on the Smart Plug. That results in kettle starting to boil water.

It also sends a message to a SQS queue which triggers another lambda function which checks the power usage of the Smart Plug.

If the power usage is greater than zero then the lambda function schedules another check in 30 secs. 

If it's zero, than it means that the kettle turned off automatically because the water reached its boiling point.

In that case lambda function creates a reminder informing the user that the water has boiled.

