import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class CheckRoleService {
  constructor(private keycloak: KeycloakService) {
    this.listRole = this.keycloak.getUserRoles();
  }

  hasAnyRoleOf(desiredRoles: string[]) {
    for (const role of desiredRoles) {
      if (this.listRole.includes(role)) {
        return role;
      }
    }
    return null;
  }

  checkRole(role: string) {
    return this.listRole.some((str) => str.includes(role));
  }

  listRole: string[] = [];
}
