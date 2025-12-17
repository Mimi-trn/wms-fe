
export const environment = {
  production: false,
  api_end_point: 'http://localhost:9098',
  auth_api: '/api/auth/',
  keycloak: {
    issuer: 'http://14.177.233.226:8444/auth/',
    realm: 'Facenet',
    clientId: 'wms_local',
  },
  BASE_API_URI: {
    NOTIFICATION_SERVICE: 'http://dev.apimksmart.xfactory.vn/wms',
    BASE_SERVICE_API: 'http://localhost:8088/',
    CLIENT_ADDRESS: 'http://localhost:8082',
  },
};
