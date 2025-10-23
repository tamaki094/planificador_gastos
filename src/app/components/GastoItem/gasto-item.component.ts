import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Gasto } from '../../interfaces';
import { CurrencyPipe } from '@angular/common';


@Component({
  selector: 'gasto-item',
  imports: [CurrencyPipe],
  templateUrl: './gasto-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GastoItemComponent {

  @Input() gasto!: Gasto;

  getImagenCategoria() {
    switch(this.gasto.categoria_gasto) {
      case 'alimentacion':
        return 'comida.svg';
      case 'transporte':
        return 'bus.svg';
      case 'entretenimiento':
        return 'entretenimiento.svg';
      case 'salud':
        return 'salud.svg';
      case 'educacion':
        return 'educacion.svg';
      case 'mascotas':
        return 'mascotas.svg';
      case 'vivienda':
        return 'casa.svg';
      case 'servicios':
        return 'servicios.svg';
      default:
        return 'default.svg';
    }
  }
}
