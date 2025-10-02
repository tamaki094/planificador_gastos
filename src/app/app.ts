import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AsideMenuComponent } from "./shared/aside-menu/aside-menu.component";
import { NavBarComponent } from './shared/nav-bar/nav-bar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { AuthService } from './services/Auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsideMenuComponent, NavBarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{

  protected readonly title = signal('PlanificadorGastos');
  isUserAuthenticated = signal(false);
  authService = inject(AuthService);
  router = inject(Router);

   ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if(user){
        console.log('🔍 Auth state changed in App:', user);
        this.isUserAuthenticated.set(true);
      }
      else{
        this.isUserAuthenticated.set(false);
      }
    });
  }

  handleSignOut() {
    console.log('🔴 Sign Out ejecutado');
    this.authService.logout();
    this.router.navigate(['/login']);

  }

  handleSignIn() {
    console.log('🟢 Sign In ejecutado');
  }
}
