const axios = require('axios');

const HUIDU_AGENCY_UID = process.env.HUIDU_AGENCY_UID;
const HUIDU_SERVER_URL = process.env.HUIDU_SERVER_URL || 'https://jsgame.live';

const huiduClient = axios.create({
  baseURL: HUIDU_SERVER_URL,
  timeout: 30000,
});

const getProviders = async () => {
  const { data } = await huiduClient.get('/game/providers', {
    params: { agency_uid: HUIDU_AGENCY_UID },
  });
  if (data.code !== 0) throw new Error(`Huidu error: ${data.msg}`);
  return data.data || [];
};

const getGameList = async (supplierCode) => {
  const { data } = await huiduClient.get('/game/list', {
    params: { agency_uid: HUIDU_AGENCY_UID, code: supplierCode },
  });
  if (data.code !== 0) throw new Error(`Huidu error: ${data.msg}`);
  return data.data || [];
};

module.exports = { getProviders, getGameList };
