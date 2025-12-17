export const SCROLL_TABLE = {
  SCROLL_X: '2000px',
  SCROLL_Y: '750px',
};
import { environment } from 'src/environment/environment';

export const WEBSOCKET_ENDPOINT = `${environment.BASE_API_URI.NOTIFICATION_SERVICE}ws-notification`;
export const WEBSOCKET_NOTIFY_TOPIC = '/topic/notification';
export const WEBSOCKET_NOTIFY_TOPIC_ALL = '/topic/all';
