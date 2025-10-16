import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MontosService } from '../../services/Montos.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './Dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardComponent implements OnInit {

  montoAhorro = signal<number>(15);
  montoGastosVivir = signal<number>(75);
  montoProvisiones = signal<number>(5);
  montoPlay = signal<number>(5);

  @ViewChild('ahorroSlider') ahorroSlider!: ElementRef<HTMLInputElement>;
  @ViewChild('gastosSlider') gastosSlider!: ElementRef<HTMLInputElement>;
  @ViewChild('provisionesSlider') provisionesSlider!: ElementRef<HTMLInputElement>;
  @ViewChild('playSlider') playSlider!: ElementRef<HTMLInputElement>;

  montosService = inject(MontosService);


  ngOnInit() {
    // Aquí puedes realizar alguna acción al inicializar el componente
  }

   onAhorroChange(event: Event) {
    const nuevoValor = parseInt((event.target as HTMLInputElement).value);
    const otrosValores = this.montoGastosVivir() + this.montoProvisiones() + this.montoPlay();

    if (nuevoValor + otrosValores > 100) {
      // ✅ Calcular el máximo permitido
      const maximoPermitido = 100 - otrosValores;
      const valorFinal = Math.max(0, maximoPermitido);
      this.montoAhorro.set(valorFinal);
      setTimeout(() => {
        if (this.ahorroSlider) {
          this.ahorroSlider.nativeElement.value = valorFinal.toString();
        }
      }, 0);
      console.log(`Ahorro ajustado a ${maximoPermitido}% para no exceder 100%`);
    } else {
      this.montoAhorro.set(nuevoValor);
    }
  }

  onGastosVivirChange(event: Event) {
    const nuevoValor = parseInt((event.target as HTMLInputElement).value);
    const otrosValores = this.montoAhorro() + this.montoProvisiones() + this.montoPlay();

    if (nuevoValor + otrosValores > 100) {
      const maximoPermitido = 100 - otrosValores;
      const valorFinal = Math.max(0, maximoPermitido);
      this.montoGastosVivir.set(valorFinal);
      setTimeout(() => {
        if (this.gastosSlider) {
          this.gastosSlider.nativeElement.value = valorFinal.toString();
        }
      }, 0);
      console.log(`Gastos ajustado a ${maximoPermitido}% para no exceder 100%`);
    } else {
      this.montoGastosVivir.set(nuevoValor);
    }
  }

  onProvisionesChange(event: Event) {
    const nuevoValor = parseInt((event.target as HTMLInputElement).value);
    const otrosValores = this.montoAhorro() + this.montoGastosVivir() + this.montoPlay();

    if (nuevoValor + otrosValores > 100) {
      const maximoPermitido = 100 - otrosValores;
      const valorFinal = Math.max(0, maximoPermitido);
      this.montoProvisiones.set(valorFinal);
      setTimeout(() => {
        if (this.provisionesSlider) {
          this.provisionesSlider.nativeElement.value = valorFinal.toString();
        }
      }, 0);
      console.log(`Provisiones ajustado a ${maximoPermitido}% para no exceder 100%`);
    } else {
      this.montoProvisiones.set(nuevoValor);
    }
  }

  onPlayChange(event: Event) {
    const nuevoValor = parseInt((event.target as HTMLInputElement).value);
    const otrosValores = this.montoAhorro() + this.montoGastosVivir() + this.montoProvisiones();

    if (nuevoValor + otrosValores > 100) {
      const maximoPermitido = 100 - otrosValores;
      const valorFinal = Math.max(0, maximoPermitido);
      this.montoPlay.set(valorFinal);
      setTimeout(() => {
        if (this.playSlider) {
          this.playSlider.nativeElement.value = valorFinal.toString();
        }
      }, 0);
      console.log(`Play ajustado a ${maximoPermitido}% para no exceder 100%`);
    } else {
      this.montoPlay.set(nuevoValor);
    }
  }

  // ✅ Método helper para obtener el total
  getTotal(): number {
    return this.montoAhorro() + this.montoGastosVivir() + this.montoProvisiones() + this.montoPlay();
  }

  // ✅ Método para clase CSS del total
  getTotalClass(): string {
    const total = this.getTotal();
    if (total === 100) return 'text-green-600 font-bold';
    if (total > 100) return 'text-red-600 font-bold';
    return 'text-yellow-600 font-bold';
  }

  guardarCambios() {

    let montos = {
      ahorro: this.montoAhorro(),
      gastos_vivir: this.montoGastosVivir(),
      provisiones: this.montoProvisiones(),
      play: this.montoPlay(),
      usuario: 'usuario_ejemplo', // Reemplaza con el ID del usuario actual
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    };
    this.montosService.guardarMontos(montos);
  }

}

