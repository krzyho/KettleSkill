import { Lambda, SQS } from 'aws-sdk';
import * as Ask from 'ask-sdk';
import { Handler } from 'aws-lambda';
const { QUEUE_URL } = process.env;

export const handler: Handler = Ask.SkillBuilders.custom()
  .addRequestHandlers({
    canHandle: handlerInput => true,
    handle: async handlerInput => {
      const { context } = handlerInput.requestEnvelope;
      const emptyPayload = '{}';
      const switchOnPromise = new Lambda()
        .invoke({
          FunctionName: 'KettleSkill-dev-switch-on',
        })
        .promise();
      const params: any = {
        MessageBody:
          (context &&
            `{"apiAccessToken" : "${context.System.apiAccessToken}"}`) ||
          emptyPayload,
        QueueUrl: QUEUE_URL,
        DelaySeconds: 10,
      };
      const scheduleSwitchOffPromise = new SQS().sendMessage(params).promise();
      return Promise.all([switchOnPromise, scheduleSwitchOffPromise]).then(
        data => {
          return handlerInput.responseBuilder
            .speak('Boiling the water now.')
            .getResponse();
        },
        err => {
          console.log(err);
          return err;
        }
      );
    },
  })
  .lambda();
