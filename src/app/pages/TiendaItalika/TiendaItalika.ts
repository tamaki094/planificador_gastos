import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ApiTiendaItalika } from '../../services/ApiTiendaItalika';
import { RouterModule, RouterOutlet } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tienda-italika',
  imports: [RouterModule, RouterOutlet, ReactiveFormsModule, CommonModule],
  templateUrl: './TiendaItalika.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TiendaItalika {

  get username() { return this.loginForm.get('username')};
  get password() { return this.loginForm.get('password')};

  private apiTiendaService = inject(ApiTiendaItalika);
  private formBuilder = inject(FormBuilder);

  loginForm: FormGroup;

  constructor() {

    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(){
    if(this.loginForm.valid){
      const formData = this.loginForm.value;
      console.log('Formulario válido', formData);
    }
    else{
      console.log('Formulario no válido');
    }
  }

  loginUser(){
    const credentials = this.loginForm.value;
    this.apiTiendaService.login(credentials).subscribe(
      response => {
        console.log('Login exitoso', response);
      },
      error => {
        console.error('Error en el login', error);
      }
    );
  }
}
