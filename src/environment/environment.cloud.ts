export const environment = {
  production: false,
  api_end_point: 'http://dev.apimksmart.xfactory.vn/wms',
  // api_end_point: 'http://52.76.174.37:9098',
  // api_end_point: 'http://192.168.188.230:9098',
  // api_end_point: 'http://localhost:9098',
   // api_end_point: 'http://localhost:9098',
  auth_api: '/api/auth/',
  keycloak: {
    issuer: 'https://sso.xfactory.vn/auth',
    // Realm
    realm: 'Facenet',
    clientId: 'wms_local',
  },
  BASE_API_URI: {
    BASE_SERVICE_API: 'http://localhost:8088/',
    CLIENT_ADDRESS: 'http://localhost:8082',
    // NOTIFICATION_SERVICE: 'http://dev.apimksmart.xfactory.vn/wms/',
    NOTIFICATION_SERVICE: 'http://dev.apimksmart.xfactory.vn/wms',

  },
}
