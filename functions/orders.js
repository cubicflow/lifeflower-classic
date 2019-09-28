
exports.handler = async function(event, context, callback) {

  const data = await parseJson(event.body)

  if (!data) {
    return error('Request requires json body');
  }

  if (data.eventName === 'order.completed') {
    const dataForShipping = transformDataForShipping(data)
    return success(dataForShipping);
  };

  return error();
}

const success = function(body, status){
  return {
    statusCode: status || 200,
    body: JSON.stringify(body),
  }
}

const error = function(message, status){
  return {
    statusCode: status || 400,
    body: message || 'Unsupported request',
  }
}

const parseJson = async function(jsonString){
  let data;
  try {
    data = await JSON.parse(jsonString);
  } catch (e) {
    data = null;
  }
  return data;
}

const transformDataForShipping = function(data){
  // todo
  return data;
}
