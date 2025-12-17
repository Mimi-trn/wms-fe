export const environment = {
  production: false,
  api_end_point: 'http://14.177.233.226:9098',
  auth_api: '/api/auth/',
  keycloak: {
    issuer: 'http://14.177.233.226:8444/auth',
    // Realm
    realm: 'Facenet',
    clientId: 'wms_local',
  },
  BASE_API_URI: {
    BASE_SERVICE_API: 'http://localhost:8088/',
    CLIENT_ADDRESS: 'http://localhost:8082',
    NOTIFICATION_SERVICE: 'http://192.168.10.205:9098'
  },
}
