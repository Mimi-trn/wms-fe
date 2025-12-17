import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from 'src/environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  url: string = environment.BASE_API_URI.NOTIFICATION_SERVICE;

  notificationMessage = new EventEmitter();
  constructor(private http: HttpClient) {}

  // /**API to update column */
  // updateMessageReceivedStatus(
  //   messageId: number,
  //   read: number
  // ): Observable<any> {
  //   const url = `${this.url}api/v1/Notifications/updateReadNotification?id=${messageId}&read=${read}`;
  //   console.log('url: ', url);
  //   return this.http.post(url, {});
  // }

  /**API to get list notification of userId */
  getNotificationsbyUserId(): Observable<any> {
    const url = `${this.url}api/v1/Notifications/searchNotificationsByUserDesc`;
    console.log('url: ', url);
    return this.http.get(url);
  }
}
