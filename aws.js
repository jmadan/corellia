const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-southeast-2" });

AWS.config.getCredentials(function (err) {
  if (err) console.log(err.stack);
  // credentials not loaded
  else {
    console.log("All good");
  }
});

const SSM = new AWS.SSM({ apiVersion: "2014-11-06" });

const getParameter = (name) => {
  let params = {
    Name: name,
    WithDecryption: true,
  };
  return new Promise((resolve) => {
    SSM.getParameter(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
      } else {
        resolve(data.Parameter.Value);
      }
    });
  });
};

module.exports = { getParameter };
