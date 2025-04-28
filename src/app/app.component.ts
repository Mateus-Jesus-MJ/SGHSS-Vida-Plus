import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxUiLoaderModule } from 'ngx-ui-loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxUiLoaderModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'SGHSS-VidaPlus';
}
