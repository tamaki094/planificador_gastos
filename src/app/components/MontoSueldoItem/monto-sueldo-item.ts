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

  @Input() categoria!: string;
  @Input() porcentajeMonto!: number;
  @Input() sueldo!: Sueldo;
  @Input() sumaGastos?: number;

  @Output() sueldoRestante = new EventEmitter<{categoria: string, valor: number}>();

  ngOnInit() {
    console.log('💼 Detalle del sueldo:', {
      categoria: this.categoria,
      porcentaje: this.porcentajeMonto + '%',
      sueldoTotal: this.sueldo?.sueldo || 'No definido',
      gastos: this.sumaGastos || 0,
    });

    const valor = this.calcularSueldoRestante();

    this.sueldoRestante.emit({
      categoria: this.categoria,
      valor: valor
    });

  }
  calcularSueldoRestante(): number {
    if (!this.sueldo?.sueldo) return 0;
    return ((this.sueldo.sueldo * this.porcentajeMonto) / 100) - (this.sumaGastos || 0);
  }
}
