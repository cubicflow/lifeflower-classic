

const SHIPSTATION_USERNAME = '';
const SHIPSTATION_PASSWORD = '';
const CREATE_ORDER_ENDPOINT = 'https://ssapi.shipstation.com/orders/createorder';

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

const getOrderNumber = function() {
  return Math.floor(Math.random() * 10000000000);
}

const generateAddressModel = function(data) {
  return {
    ...snipcartAddress,
    name: data.name,
    company: data.company,
    street1: data.address1,
    street2: data.address2,
    city: data.city,
    state: data.province,
    country: data.country,
    phone: data.phone,
  }
}

const transformDataForShipping = function(data){
  const transformedData = {
    ...data.content,
    orderNumber: getOrderNumber(),
    orderDate: data.createdOn,
    paymentDate: data.createdOn,
    orderStatus: 'awaiting_shipment',
    billTo: generateAddressModel(data.content.billingAddress),
    shipTo: generateAddressModel(data.content.shippingAddress),
  }
  return transformedData;
}
