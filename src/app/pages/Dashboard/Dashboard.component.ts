import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MontosService } from '../../services/Montos.service';
import { AuthService } from '../../services/Auth.service';
import { User } from 'firebase/auth';
import { Gasto, Montos, Sueldo } from '../../interfaces';
import { GastoService } from '../../services/Gasto.service';
import { GastoItemComponent } from "../../components/GastoItem/gasto-item.component";
import { MontoSueldoItem } from "../../components/MontoSueldoItem/monto-sueldo-item";
import { SueldoService } from '../../services/Sueldo.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, GastoItemComponent, MontoSueldoItem],
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
  montos = signal<Montos | null>(null);
  sueldo = signal<Sueldo | null>(null);
  sueldoRestanteTotal = signal<number>(0);


  montosService = inject(MontosService);
  authService = inject(AuthService);
  gastosService = inject(GastoService);
  sueldoService = inject(SueldoService);

  user : User | null = null;


  @ViewChild('ahorroSlider') ahorroSlider!: ElementRef<HTMLInputElement>;
  @ViewChild('gastosSlider') gastosSlider!: ElementRef<HTMLInputElement>;
  @ViewChild('provisionesSlider') provisionesSlider!: ElementRef<HTMLInputElement>;
  @ViewChild('playSlider') playSlider!: ElementRef<HTMLInputElement>;

  sueldosRestantes = signal<{[key: string]: number}>({
    ahorro: 0,
    gastos_vivir: 0,
    provisiones: 0,
    play: 0
  });

   totalSueldoRestante = computed(() => {
    const restantes = this.sueldosRestantes();
    const total = Object.values(restantes).reduce((sum, valor) => sum + valor, 0);
    console.log('🧮 Total sueldo restante calculado:', total);
    return total;
  });

  onSueldoRestanteChange(data: {categoria: string, valor: number}) {
    console.log(`💼 Sueldo restante ${data.categoria}:`, data.valor);

    this.sueldosRestantes.update(restantes => ({
      ...restantes,
      [data.categoria]: data.valor
    }));

    console.log('📊 Estado actual sueldos restantes:', this.sueldosRestantes());
    console.log('🧮 Total actual:', this.totalSueldoRestante());
  }


  async ngOnInit() {
    this.user = await this.authService.getCurrentUser();
    this.montosService.consultaMontosPorUsuario(this.user?.uid || '').subscribe(
      (montos) => {
        this.montos.set(montos);
        if(montos){
          console.log(`Montos obtenidos de  ${this.user?.uid}: ${montos}`);
          this.montoAhorro.set(montos?.ahorro || 0);
          this.montoGastosVivir.set(montos?.gastos_vivir || 0);
          this.montoProvisiones.set(montos?.provisiones || 0);
          this.montoPlay.set(montos?.play || 0);

        }

      }
    );

    this.sueldoService.getSueldoByUser(this.user?.uid || '')
      .subscribe((sueldo) =>{
        this.sueldo.set(sueldo);
        console.log(`Sueldo obtenido de  ${this.user?.uid}: ${this.sueldo()}`);
    });

    this.gastosService.getAllGastosByUser(this.user?.uid || '').subscribe(
      (gastos) => {
        if (gastos) {
          this.gastos.set(gastos);
        }
      }
    );

  }
  datosListos = computed(() => {
    return this.montos() !== null && this.sueldo() !== null;
  });


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

}

