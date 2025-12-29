import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';
import {
  faHome,
  faUser,
  faTable,
  faDollarSign,
  faBell,
  faSignIn,
  faUserPlus,
  faTimes,
  faCreditCard,
  faMessage
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'aside-menu',
  imports: [RouterLink, RouterLinkActive, FontAwesomeModule, RouterModule],
  templateUrl: './aside-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AsideMenuComponent {
  faHome = faHome;
  faUser = faUser;
  faTable = faTable;
  faDollarSign = faDollarSign;
  faBell = faBell;
  faSignIn = faSignIn;
  faUserPlus = faUserPlus;
  faTimes = faTimes;
  faCreditCard = faCreditCard;
  faMessage = faMessage;

  onSignIn = output<void>();
  onSignOut = output<void>();

  isAuthenticated = input<boolean>(false);

  ngOnInit() {
    console.log('🔍 Estado inicial en aside-menu:', this.isAuthenticated());
  }


}
