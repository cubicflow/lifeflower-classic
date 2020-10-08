const fetch = require('node-fetch');

const SHIPSTATION_KEY = '8741aa9334f2468c909d46af681bf7af';
const SHIPSTATION_SECRET = 'f468e9144f424f2cb8a1c70abaffe8fe';
const CREATE_ORDER_ENDPOINT = 'https://ssapi.shipstation.com/orders/createorder';

exports.handler = async function(event, context, callback) {

  const data = await parseJson(event.body)

  if (!data) {
    return error('Request requires json body');
  }

  if (data.eventName === 'order.completed') {
    return handleOrderCompleted(data);
  };

  return error({}, 202);
}

const handleOrderCompleted = function(data) {
  const dataForShipping = transformDataForShipping(data);

  return fetch(CREATE_ORDER_ENDPOINT, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(SHIPSTATION_KEY + ":" + SHIPSTATION_SECRET).toString('base64')
    },
    body: JSON.stringify(dataForShipping),
  }).then((res) => {

    if (!res.ok) {
      return error({res, serverMessage: 'Shipstation request not OK'});
    }

    return res.json()
  }).then((json) => {
    return success(json);
  }).catch((error) => {
    return error({error, serverMessage: 'Shipstation request network error'});
  });
}

const success = function(body, status){
  return {
    statusCode: status || 200,
    body: JSON.stringify(body),
  }
}

const error = function(body, status){
  return {
    statusCode: status || 400,
    body: JSON.stringify(body) || 'Unsupported request',
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

const getOrderNumber = function() {
  return Math.floor(Math.random() * 10000000000);
}

const generateAddressModel = function(data) {
  return {
    name: data.name,
    company: data.company,
    street1: data.address1,
    street2: data.address2,
    city: data.city,
    state: data.province,
    postalCode: data.postalCode,
    country: data.country,
    phone: data.phone,
  }
}

const transformDataForShipping = function(data){
  const transformedData = {
    ...data.content,
    orderNumber: data.content.invoiceNumber,
    orderKey: data.content.invoiceNumber,
    orderDate: data.createdOn,
    paymentDate: data.createdOn,
    orderStatus: 'awaiting_shipment',
    billTo: generateAddressModel(data.content.billingAddress),
    shipTo: generateAddressModel(data.content.shippingAddress),
    requestedShippingService: data.content.shippingMethod,
    customerEmail: data.content.email,
    items: data.content.items.map(item => {
      return {
        ...item,
        weight: (item.weight) ? {
          value: item.weight,
          units: 'grams'
        } : null,
        dimensions: (item.dimensions) ? {
          length: item.length,
          width: item.width,
          height: item.height,
          units: 'centimeters'
        } : null
      }
    })
  }
  return transformedData;
}
