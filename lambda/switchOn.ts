import { Handler } from 'aws-lambda';
import { login } from 'tplink-cloud-api';
const { TPLINK_LOGIN, TPLINK_PASSWORD, SMART_PLUG_ALIAS } = process.env;

export const handler: Handler = async (event: any) => {
  try {
    const tplink = await login(TPLINK_LOGIN, TPLINK_PASSWORD);
    await tplink.getDeviceList();
    const kettleSmartPlug = tplink.getHS110(SMART_PLUG_ALIAS);
    await kettleSmartPlug.powerOn();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Switched on!',
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Something went wrong - ${err.message}`,
      }),
    };
  }
};
