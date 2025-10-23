import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MontosService } from '../../services/Montos.service';
import { AuthService } from '../../services/Auth.service';
import { User } from 'firebase/auth';
import { Gasto } from '../../interfaces';
import { GastoService } from '../../services/Gasto.service';
import { GastoItemComponent } from "../../components/GastoItem/gasto-item.component";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, GastoItemComponent],
  templateUrl: './Dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardComponent implements OnInit {



  montoAhorro = signal<number>(0);
  montoGastosVivir = signal<number>(0);
  montoProvisiones = signal<number>(0);
  montoPlay = signal<number>(0);
  montoSueldoAhorro = signal<number>(0);
  montoSueldoGastosVivir = signal<number>(0);
  montoSueldoProvisiones = signal<number>(0);
  montoSueldoPlay = signal<number>(0);
  minimizedDistribucion = signal(false);
  minimizedGastos = signal(false);
  minimizedSueldos = signal(false);
  gastos = signal<Gasto[]>([]);

  montosService = inject(MontosService);
  authService = inject(AuthService);
  gastosService = inject(GastoService);

  user : User | null = null;

  @ViewChild('ahorroSlider') ahorroSlider!: ElementRef<HTMLInputElement>;
  @ViewChild('gastosSlider') gastosSlider!: ElementRef<HTMLInputElement>;
  @ViewChild('provisionesSlider') provisionesSlider!: ElementRef<HTMLInputElement>;
  @ViewChild('playSlider') playSlider!: ElementRef<HTMLInputElement>;




  async ngOnInit() {
    this.user = await this.authService.getCurrentUser();
    this.montosService.consultaMontosPorUsuario(this.user?.uid || '').subscribe(
      (montos) => {
        console.log(`Montos obtenidos de  ${this.user?.uid}: ${montos}`);
        this.montoAhorro.set(montos?.ahorro || 0);
        this.montoGastosVivir.set(montos?.gastos_vivir || 0);
        this.montoProvisiones.set(montos?.provisiones || 0);
        this.montoPlay.set(montos?.play || 0);
        this.calcularMontosSueldos();
      }
    );
    this.gastosService.getAllGastosByUser(this.user?.uid || '').subscribe(
      (gastos) => {
        if (gastos) {
          this.gastos.set(gastos);
        }
      }
    );

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
      usuario: this.user?.uid || 'desconocido',
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    };
    this.montosService.guardarMontos(montos);
  }

  toggleMinimize(seccion: string | HTMLElement) {
    let seccionId: string;

    if (typeof seccion === 'string') {
      seccionId = seccion;
    }
    else {
      seccionId = seccion.id || seccion.getAttribute('id') || '';
    }

    switch(seccionId) {
      case 'seccion-distribucion':
        this.minimizedDistribucion.set(!this.minimizedDistribucion());
        break;
      case 'seccion-gastos':
        this.minimizedGastos.set(!this.minimizedGastos());
        break;
      default:
        console.warn('Sección no encontrada:', seccionId);
    }
  }

  calcularTotalGastos(): number {
    return this.gastos().reduce((total, gasto) => total + gasto.monto, 0);
  }


  calcularMontosSueldos() {
    const totalMontos = this.calcularTotalGastos();
    const totalSueldos = 38000;

    this.montoSueldoAhorro.set((this.montoAhorro() / 100) * totalSueldos);
    this.montoSueldoGastosVivir.set((this.montoGastosVivir() / 100) * totalSueldos);
    this.montoSueldoProvisiones.set((this.montoProvisiones() / 100) * totalSueldos);
    this.montoSueldoPlay.set((this.montoPlay() / 100) * totalSueldos);

    console.log('Total Sueldos:', totalSueldos);
    console.log('Monto Ahorro %:', this.montoAhorro());
    console.log('Monto Gastos Vivir %:', this.montoGastosVivir());
    console.log('Monto Provisiones %:', this.montoProvisiones());
    console.log('Monto Play %:', this.montoPlay());

  }
}

