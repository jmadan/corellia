"use strict";
const awsObject = require("./aws");
const service = require("./tickerService");
const tokenService = require("./tokenService");

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

    service.getLatestPrices(body, marketStackApiKey).then(async (response) => {
      let latestPrice = response.data;
      if (latestPrice.close !== 0) {
        await service.updatePrices(latestPrice, token);
      }
      return successResponse(
        201,
        `daily prices for symbols updated successfully on ${Date.now()}`
      );
    });
  } catch (err) {
    return errorResponse(500, err);
  }
};
