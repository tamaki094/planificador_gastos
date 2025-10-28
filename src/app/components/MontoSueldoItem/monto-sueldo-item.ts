import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { Montos, Sueldo } from '../../interfaces';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'monto-sueldo-item',
  imports: [CurrencyPipe],
  templateUrl: './monto-sueldo-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MontoSueldoItem implements OnInit {

  @Input() porcentajeMonto!: number | undefined;
  @Input() sueldo!: Sueldo | null;
  @Input() sumaGastos!: number | null;

  // ✅ OUTPUT para enviar al padre
  @Output() sueldoRestanteChange = new EventEmitter<number>();

  montoCalculado = signal<number>(0);
  sueldoRestante = signal<number>(0);

  ngOnInit() {
    console.log(`MontoSueldoItem recibido porcentajeMonto: ${this.porcentajeMonto}, sueldo: ${this.sueldo?.sueldo}`);

    const totalSueldos = this.sueldo?.sueldo || 0;
    this.montoCalculado.set(((this.porcentajeMonto || 0) / 100) * totalSueldos);

    const restante = this.montoCalculado() - (this.sumaGastos || 0);
    this.sueldoRestante.set(restante);

    if(this.sumaGastos! > 0) {
      this.sueldoRestanteChange.emit(restante);
    }
    else{
      this.sueldoRestanteChange.emit(this.montoCalculado());
    }
  }
}
