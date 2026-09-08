import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = 'http://localhost:4566/restapis/xcxkpfyrww/dev/_user_request_/users';

  constructor(private http: HttpClient) {}


  crearPerfilBackEnd(user: Usuario) {
    const payLoad = {
      UserId: user.uid,
      Name: user.nombre,
      Role: 'Cliente'
    };

    return this.http.post(this.apiUrl,payLoad);
  }

}

