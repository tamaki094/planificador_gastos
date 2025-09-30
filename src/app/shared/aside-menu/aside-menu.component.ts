import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faHome,
  faUser,
  faTable,
  faDollarSign,
  faBell,
  faSignIn,
  faUserPlus,
  faTimes,
  faCreditCard
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'aside-menu',
  imports: [RouterLink, RouterLinkActive, FontAwesomeModule],
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
  faCreditCard = faCreditCard

}
