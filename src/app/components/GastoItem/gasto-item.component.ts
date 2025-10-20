import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Gasto } from '../../interfaces';

@Component({
  selector: 'gasto-item',
  imports: [],
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
      case 'hogar':
        return 'hogar.svg';
      default:
        return 'default.svg';
    }
  }
}
