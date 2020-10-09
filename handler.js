"use strict";
const awsObject = require("./aws");
const service = require("./tickerService");
const tokenService = require("./tokenService");
const Rollbar = require("rollbar");

var rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true
});


const errorResponse = (statusCode, message) => ({
  statusCode: statusCode || 501,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(message) || "Internal Server Error",
});

const successResponse = (statusCode = 200, message) => ({
  statusCode: statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(message),
});

module.exports.index = async (event) => {
  try {
    const { Records } = event;
    const token = await tokenService.getToken();
    const marketStackApiKey = await awsObject.getParameter(
      "MARKETSTACK_API_KEY"
    );
    const { access_token, expires_in, token_type } = token;
    const { body } = Records[0];

    const eodPrice = await service.getLatestPrices(body, marketStackApiKey)
    let latestEoDPrice = eodPrice.data
    if (latestEoDPrice.close !== 0) {
      await service.updatePrices(latestEoDPrice, token);
      console.log(`daily prices for symbol ${latestEoDPrice.symbol} updated successfully on ${Date.now()}`)
      return successResponse(
        201,
        `daily prices for symbol ${latestEoDPrice.symbol} updated successfully on ${Date.now()}`
      );
    }      
  } catch (err) {
    rollbar.log('eodOfPrices',err)
    return errorResponse(500, err);
  }
};
