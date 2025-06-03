import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxMaskPipe } from 'ngx-mask';
import { Ala } from '../../../_models/ala';
import { ToastrService } from 'ngx-toastr';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { param } from 'jquery';
import { AlasService } from '../../../_services/alas.service';

@Component({
  selector: 'app-visualizar-ala',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxMaskPipe, RouterModule],
  templateUrl: './visualizar-ala.component.html',
  styleUrl: './visualizar-ala.component.scss'
})
export class VisualizarAlaComponent implements OnInit {
  form!: FormGroup;
  ala!: Ala;

  constructor(private routeAcitive: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private loader: NgxUiLoaderService,
    private alaService: AlasService
  ) {
    this.form = new FormGroup({
      nome: new FormControl('', Validators.required),
      responsavel: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.loader.start();

    this.routeAcitive.paramMap.subscribe(params => {
      const id = params.get('id');

      if (id == null || id == "") {
        this.toastr.error("Ala não encontrada", "", { progressBar: true });
        this.router.navigateByUrl("admin/alas");
        this.loader.stop();
        return
      }
      this.buscarAla(id);

    })

  }

  buscarAla(id: string) {
    this.alaService.buscarAlaPorId(id).subscribe(
      (ala) => {
        if (ala) {
          this.ala = ala;
          this.populateForm(ala);
        }else{
          this.toastr.error("Ala não encontrada. Verifique o id informado e tente novamente\n se o problema persistir procure o administrador do sistema", "", { "progressBar": true });
          this.loader.stop();
        }
      }
    )
  }

  populateForm(ala: Ala) {
    this.form.patchValue({
      nome: ala.nome,
      responsavel: ala.responsavel?.nome
    });
    this.loader.stop();
  }
}
