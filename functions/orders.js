
const fetch = require("node-fetch")

exports.handler = async function(event, context, callback) {

  return {
    statusCode: 200,
    body: {hello: 'I love you'},
  }
}
