import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class PopupConfirmService {
  constructor() {}

  /**
   * Function to display a popup confirm
   * @param title title of popupư
   * @param text content of popup
   * @param isDanger to display color of button confirm, true->red / false->green
   * @param action function after click confirm button
   *
   * Example:
   * ```
   * showPopupConfirm(
   *  'Xác nhận xóa',
   *  'Bạn có chắc chắn xóa',
   *  true,
   *  () => {
   *     delete(item).subscribe((res)=>{
   *        showResultPopup(res.result.message, res.result.ok);
   *     })
   *   }
   * )
   * ```
   */
  showPopupConfirm(
    title: string,
    text: string,
    isDanger: boolean,
    action: () => void
  ) {
    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      confirmButtonColor: !isDanger ? '#28a745' : '#dc3545',
      cancelButtonText: '\xa0\xa0\xa0\xa0\xa0'+'Hủy'+'\xa0\xa0\xa0\xa0\xa0',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        action();
      }
    });
  }

  /**
   * Function to display a popup after confirm
   * @param message result
   * @param ok status : true->success / false->error
   *
   * Example:
   * ```
   * showResultPopup(
   *  'Thành công',
   *  true,
   * )
   * ```
   */
  showResultPopup(message: string, ok: boolean) {
    Swal.fire(message, '', ok ? 'success' : 'error');
  }
}
