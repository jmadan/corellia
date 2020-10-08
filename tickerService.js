const axios = require("axios");

const getLatestPrices = async (event, marketStackApiKey) => {
  let ticker = JSON.parse(event);
  console.log(ticker);
  let symbol = "";
  if (ticker.exchange === "NSX" || ticker.exchange === "NASDAQ") {
    symbol = ticker.symbol;
  } else {
    symbol = `${ticker.symbol}.${ticker.micCode}`;
  }

  const config = {
    method: "get",
    url: `http://api.marketstack.com/v1/tickers/${symbol}/eod/latest?access_key=${marketStackApiKey}`,
  };
  return await axios(config);
};

const updatePrices = async (ticker, token) => {
  const config = {
    method: "post",
    url: `${process.env.API_URL}/stocks/prices/daily`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      tickerSymbol: ticker.symbol,
      exchange: ticker.exchange,
      closePrice: ticker.close,
      closeDate: new Date(ticker.date).getTime(),
    },
  };
  const result = await axios(config);
  return result;
};

module.exports = { getLatestPrices, updatePrices };
