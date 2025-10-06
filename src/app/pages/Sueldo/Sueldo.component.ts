import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgForm, FormsModule} from '@angular/forms'

@Component({
  selector: 'app-sueldo',
  imports: [CommonModule, FormsModule],
  templateUrl: './Sueldo.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SueldoComponent {
  sueldo: number = 12000;
}
