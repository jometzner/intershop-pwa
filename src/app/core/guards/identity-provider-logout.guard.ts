import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from '@angular/router';

import { IdentityProviderFactory } from 'ish-core/identity-provider/identity-provider.factory';

@Injectable({ providedIn: 'root' })
export class IdentityProviderLogoutGuard implements CanActivate {
  constructor(private identityProviderFactory: IdentityProviderFactory) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.identityProviderFactory.getInstance().triggerLogout(route, state);
  }
}
