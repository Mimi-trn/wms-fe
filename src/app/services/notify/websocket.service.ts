import { KeycloakService } from 'keycloak-angular';
import { Injectable } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {
  WEBSOCKET_ENDPOINT,
  WEBSOCKET_NOTIFY_TOPIC,
  WEBSOCKET_NOTIFY_TOPIC_ALL,
} from 'src/app/utils/constrant';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  stompClient: any;

  constructor(
    private notificationService: NotificationService,
    private keycloak: KeycloakService
  ) {}

  connect(): void {
    console.log('webSocket Connection');
    const ws = new SockJS(WEBSOCKET_ENDPOINT);
    console.log('webSocketEndpoint: ', WEBSOCKET_ENDPOINT);
    this.stompClient = Stomp.over(ws);
    const _this = this;
    _this.stompClient.connect(
      {},
      (frame: any) => {
        _this.stompClient.subscribe(
          // `${WEBSOCKET_NOTIFY_TOPIC}/${this.keycloak.getUsername()}`,
          `${WEBSOCKET_NOTIFY_TOPIC}/hieubx@tmd.vn`,
          function (sdkEvent: any) {
            _this.onMessageReceived(sdkEvent);
          }
        );
        this.stompClient.subscribe(
          WEBSOCKET_NOTIFY_TOPIC_ALL,
          function (sdkEvent: any) {
            _this.onMessageReceived(sdkEvent);
          }
        );
      },
      this.errorCallBack
    );
    console.log('webSocket Connection');
  }

  disconnect(): void {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
    }
    console.log('Disconnected');
  }

  // on error, schedule a reconnection attempt
  errorCallBack(error: string) {
    console.log('errorCallBack -> ' + error);
    setTimeout(() => {
      this.connect();
    }, 5000);
  }

  onMessageReceived(message: any) {
    console.log('Message Recieved from Server :: ' + message);
    // Emits the event.
    this.notificationService.notificationMessage.emit(
      JSON.parse(message?.body)
    );
  }
}
