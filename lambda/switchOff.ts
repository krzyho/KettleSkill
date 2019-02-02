import { SQS } from 'aws-sdk';
import { Handler } from 'aws-lambda';
import * as request from 'request-promise';
import { login } from 'tplink-cloud-api';
const {
  TPLINK_LOGIN,
  TPLINK_PASSWORD,
  SMART_PLUG_ALIAS,
  QUEUE_URL,
} = process.env;

export const handler: Handler = async (event: any) => {
  try {
    const tplink = await login(TPLINK_LOGIN, TPLINK_PASSWORD);
    const deviceList = await tplink.getDeviceList();
    const kettleSmartPlug = tplink.getHS110(SMART_PLUG_ALIAS);
    const powerUsage = await kettleSmartPlug.getPowerUsage();

    const body = JSON.parse(event.Records[0].body);
    var options = {
      method: 'POST',
      uri: 'https://api.amazonalexa.com/v1/alerts/reminders',
      headers: {
        Authorization: `Bearer ${body.apiAccessToken}`,
        'Content-Type': 'application/json',
      },
      json: true,
      body: {
        trigger: { type: 'SCHEDULED_RELATIVE', offsetInSeconds: '1' },
        alertInfo: {
          spokenInfo: {
            content: [
              {
                locale: 'en-US',
                text: 'The water has boiled. Go and make a nice cuppa tea.',
              },
            ],
          },
        },
        pushNotification: { status: 'ENABLED' },
      },
    };
    if (powerUsage.power_mw === 0) {
      return Promise.all([
        kettleSmartPlug.powerOff(),
        request(options).promise(),
      ]).then(
        results => {
          return {
            statusCode: 200,
            body: JSON.stringify({
              message: 'Done!',
            }),
          };
        },
        err => {
          console.log(err);
          return {
            statusCode: 500,
            body: JSON.stringify({
              message: `Something went wrong - ${err.message}`,
            }),
          };
        }
      );
    } else {
      const params: any = {
        MessageBody: JSON.stringify(body),
        QueueUrl: QUEUE_URL,
        DelaySeconds: 30,
      };
      return new SQS()
        .sendMessage(params)
        .promise()
        .then(() => {
          return {
            statusCode: 200,
            body: JSON.stringify({
              message: 'We should check again laterrrrrr...',
            }),
          };
        });
    }
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Something went wrong - ${err.message}`,
      }),
    };
  }
};
