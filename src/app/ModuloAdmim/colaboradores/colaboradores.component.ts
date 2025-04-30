import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-colaboradores',
  imports: [RouterModule],
  templateUrl: './colaboradores.component.html',
  styleUrl: './colaboradores.component.scss'
})
export class ColaboradoresComponent implements OnInit{
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }
}
