const axios = require("axios");

const oauthUrl = `https://${process.env.AUTH0_DOMAIN}/oauth/token`;
const client_id = process.env.AUTH0CLIENTID;
const client_secret = process.env.AUTH0CLIENTSECRET;
const audience = process.env.AUTH0_AUDIENCE;
const grant_type = process.env.AUTH0_GRANT_TYPE;

const getToken = async () => {
  return await axios.post(oauthUrl, {
    client_id,
    client_secret,
    audience,
    grant_type,
  });
};

module.exports = { getToken };
