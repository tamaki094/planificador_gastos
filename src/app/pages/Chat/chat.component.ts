import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'chat',
  imports: [],
  templateUrl: './chat.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChatComponent {

}
