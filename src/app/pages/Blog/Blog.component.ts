import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-blog.component',
  imports: [],
  templateUrl: './Blog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BlogComponent { }
