import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsideMenuComponent } from "./shared/aside-menu/aside-menu.component";
import { NavBarComponent } from './shared/nav-bar/nav-bar.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsideMenuComponent, NavBarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('PlanificadorGastos');
  isUserAuthenticated = signal(false);

  handleSignOut() {
    console.log('🔴 Sign Out ejecutado');
    this.isUserAuthenticated.set(false);
    console.log('Estado después:', this.isUserAuthenticated());
  }

  handleSignIn() {
    console.log('🟢 Sign In ejecutado');
    this.isUserAuthenticated.set(true);
    console.log('Estado después:', this.isUserAuthenticated());
  }
}
