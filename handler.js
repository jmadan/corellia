"use strict";
const awsObject = require("./aws");
const service = require("./tickerService");
const Rollbar = require("rollbar");

var rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true
});


const functionResponse = (statusCode, message) => ({
  statusCode,
  body: JSON.stringify(
    {
      message,
    },
    null,
    2
  ),
});

module.exports.index = async (event) => {
  try {
    const { Records } = event;
    const marketStackApiKey = await awsObject.getParameter(
      "MARKETSTACK_API_KEY"
    );
    const token = await awsObject.getParameter(
      "auth0Token"
    );

    const result = await Records.map(async (record) => {
      let { body } = record;
      if(typeof body === "string"){
        body = JSON.parse(body)
      }
      const eodPrice = await service.getLatestPrices(body, marketStackApiKey)
      let latestEoDPrice = eodPrice.data;
      if (latestEoDPrice.close !== 0) {
        return service.updatePrices(latestEoDPrice, token);
      }
    })

    return Promise.all(result).then(values =>{
      return functionResponse(201, `Latest EOD prices updated for ${values.length} tickers`)
    })
  } catch (err) {
    rollbar.log('eodOfPrices',err)
    return functionResponse(500, err);
  }
};
