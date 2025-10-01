import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './Profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProfileComponent { }
