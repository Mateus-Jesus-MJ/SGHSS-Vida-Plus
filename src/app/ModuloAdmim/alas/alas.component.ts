import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { Ala } from '../../_models/ala';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs';

@Component({
  selector: 'app-alas',
  imports: [CommonModule, RouterModule],
  templateUrl: './alas.component.html',
  styleUrl: './alas.component.scss'
})
export class AlasComponent implements OnInit {
  rotaFilhaAtiva = false;
  alas: Ala[] = [];


  constructor(private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private ngxUiLoaderService: NgxUiLoaderService,

  ) { }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.verificarRotaFilhaAtiva();
        if (!this.rotaFilhaAtiva) {

        }
      });
    this.verificarRotaFilhaAtiva();

    if (!this.rotaFilhaAtiva) {

    }
  }

   private verificarRotaFilhaAtiva(): void {
    this.rotaFilhaAtiva = this.route.children.length > 0;
  }
}
