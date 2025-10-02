import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/Auth.service';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { CategoriaService } from '../../services/Categoria.service';

@Component({
  selector: 'app-gastos-fijos',
  imports: [],
  templateUrl: './GastosFijos.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GastosFijosComponent implements OnInit {
  authService = inject(AuthService);
  user : Observable<User | null> = this.authService.currentUser$;
  categoriasService = inject(CategoriaService);

  ngOnInit() : void{
    this.user.subscribe(user => {
      if(user){
        console.log('🔍 Auth state changed in GastosFijosComponent:', user);
      }
      else{
        console.log('⛔ No hay usuario autenticado en GastosFijosComponent');
      }

      const resultado = this.categoriasService.getAllCategorias().subscribe(categorias => {
        console.log('Categorías obtenidas:', categorias);
      });
    });
  }



}
