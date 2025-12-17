import { Component, ElementRef } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NzI18nService, en_US, vi_VN } from 'ng-zorro-antd/i18n';
import { KeycloakService } from 'keycloak-angular';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { WarningService } from './services/warning/warning.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  selectLanguage: string = 'vi_VN';
  saveLanguage: string | null = '';
  srcImg: string = '';
  isCollapsed = false;
  isFullScreen = false;
  username: string = '';
  countNotify: number = 0;
  constructor(
    private translateService: TranslateService,
    private i18n: NzI18nService,
    private keycloak: KeycloakService,
    private el: ElementRef,
    private router: Router,
    private loading: NgxUiLoaderService,
    private warningService: WarningService
  ) {
    this.saveLanguage = localStorage.getItem('language');
    if (this.saveLanguage == 'vi_VN') {
      localStorage.setItem('language', this.saveLanguage);
      this.selectLanguage = this.saveLanguage;
    } else if (this.saveLanguage == 'en_US') {
      localStorage.setItem('language', this.saveLanguage);
      this.selectLanguage = this.saveLanguage;
    } else {
      this.selectLanguage = 'vi_VN';
      localStorage.setItem('language', 'vi_VN');
    }
    this.changeLanguage(this.selectLanguage);
    this.username = this.keycloak.getUsername();
    // this.router.navigate(['./']);
    // this.dashboardWarning();
  }

  async dashboardWarning() {
    let res = await this.warningService.getDashboardWarning();
    console.log(res);
  }
  // Hàm xử lý chức năng thay đổi ngôn ngữ
  changeLanguage(language: string): void {
    localStorage.setItem('language', language);
    if (language == 'vi_VN') {
      // this.i18n.setLocale(vi_VN);
      this.srcImg = './assets/image/vie.png';
    } else {
      // this.i18n.setLocale(en_US);
      this.srcImg = './assets/image/eng.png';
    }
    this.translateService.use(language);
  }
  options: any[] = [
    { label: 'en_US', value: 'en_US' },
    { label: 'vi_VN', value: 'vi_VN' },
  ];
  // Chức năng full screen
  onClickFullScreen() {
    const doc = window.document;
    const docEl = doc.documentElement;
    const requestFullScreen = docEl.requestFullscreen;
    const exitFullScreen = doc.exitFullscreen;
    if (!this.isFullScreen) {
      // Mở full screen
      if (requestFullScreen) {
        requestFullScreen.call(docEl);
      }
    } else {
      // Đóng full screen
      if (exitFullScreen) {
        exitFullScreen.call(doc);
      }
    }
    this.isFullScreen = !this.isFullScreen;
  }
  // Chức năng logout
  logout() {
    Swal.fire({
      title: 'Đăng xuất',
      text: 'Bạn có xác nhận đăng xuất không?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đăng xuất',
      confirmButtonColor: '#FF7A00',
      cancelButtonText: '\xa0' + 'Hủy bỏ' + '\xa0',
      cancelButtonColor: '#7b7b7b',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.router.navigate(['./']).then(() => {
          this.keycloak.logout();
        });
      }
    });
  }
  // Handle count
  onHandleCount(event: any) {
    this.countNotify = event;
  }

  goToExternalSite() {
    window.location.href = 'http://14.177.233.226:4000/';
  }
}
