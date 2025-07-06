import { Component, OnInit } from '@angular/core';
import { Paciente } from '../../_models/Paciente';
import { PacienteService } from '../../_services/paciente.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-prontuario',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './prontuario.component.html',
  styleUrl: './prontuario.component.scss'
})
export class ProntuarioComponent implements OnInit {
  paciente!: Paciente;

  constructor(
    private loader: NgxUiLoaderService,
    private toastr: ToastrService,
    private pacienteService: PacienteService
  ) { }

  ngOnInit(): void {
    this.loader.start();
    this.pacienteService.buscarPacienteLogado().subscribe({
      next: (paciente: Paciente) => {
        this.paciente = paciente;
        this.loader.stop();
      },error: () =>{
        this.toastr.error("Erro ao consultar prontuário do paciente","",{progressBar: true});
        this.loader.stop();
      }
    })
  }
}
