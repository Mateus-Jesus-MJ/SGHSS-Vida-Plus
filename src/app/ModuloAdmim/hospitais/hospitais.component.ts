import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core'; // Importe OnInit
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-hospitais',
  imports: [RouterModule, CommonModule],
  templateUrl: './hospitais.component.html',
  styleUrl: './hospitais.component.scss'
})
export class HospitaisComponent implements OnInit { // Implemente OnInit
  rotaFilhaAtiva = false;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void { // Use o ngOnInit para a lógica inicial
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva(); // Chame a função de verificação
      });

    this.verificarRotaFilhaAtiva(); // Verifique na inicialização também
  }

  private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }
}