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
}
