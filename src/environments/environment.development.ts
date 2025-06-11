export const environment = {
  production: false,
  apiPrincipal: 'http://localhost:3000/',
  apiConsultaCEP: 'https://viacep.com.br/ws/',
  apiConsultaEstadosMunicipios: 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/',

  firebaseConfig: {
    apiKey: "AIzaSyAyzWdAsNAD5EL7Bv0I1Ld_mhlJH0EIKT0",
    authDomain: "sghss-vidaplus.firebaseapp.com",
    projectId: "sghss-vidaplus",
    storageBucket: "sghss-vidaplus.firebasestorage.app",
    messagingSenderId: "901401357138",
    appId: "1:901401357138:web:0c46f5072e4981c4f9688b"
  },

  // apiZoom : 'http://localhost:3000/',

  apiZoom: 'https://servicezoomapi.vercel.app/api/',

  MenuAdmin: [
    {
      grupo: {
        label: 'Unidades',
        icon: 'fas fa-hospital-alt',
        filhos: [
          {
            label: 'Hospitais',
            rota: 'hospitais',
            permissoes: ['visualizar', 'incluir', 'editar', 'excluir']
          },
          {
            label: 'Alas',
            rota: 'alas',
            permissoes: ['visualizar', 'incluir', 'editar']
          }
        ]
      }
    },
    {
      grupo: {
        label: 'Gestão Pessoal',
        icon: 'far fa-address-card',
        filhos: [
          {
            label: 'Colaboradores',
            rota: 'colaboradores',
            permissoes: ['visualizar', 'incluir', 'editar', 'excluir']
          },
          {
            label: 'Cargos',
            rota: 'cargos',
            permissoes: ['visualizar', 'incluir', 'editar', 'excluir']
          },
          {
            label: 'Turnos',
            rota: 'turnos',
            permissoes: ['visualizar', 'incluir', 'excluir']
          }
        ]
      }
    },
    {
      grupo: {
        label: 'Admin Sistema',
        icon: 'fas fa-user-cog',
        filhos: [
          {
            label: 'Usuário',
            rota: 'usuarios',
            permissoes: []
          }
        ]
      }
    }
  ],

  MenuAtendimento: [
    {
      grupo: {
        label: 'Tele Consulta',
        filhos: [
          {
            label: 'Tele Consulta',
            rota: 'teleconsultas',
            permissoes: ['visualizar', 'atender', 'remover']
          },
        ]
      }
    },
  ],

  niveisDeEscolaridade: [
    { value: 'NENHUMA', label: 'Nenhuma' },
    { value: 'ENSINO FUNDAMENTAL', label: 'Ensino Fundamental' },
    { value: 'ENSINO MÉDIO', label: 'Ensino Médio' },
    { value: 'GRADUAÇÃO', label: 'Graduação' },
    { value: 'PÓS GRADUAÇÃO', label: 'Pós Graduação' },
    { value: 'MESTRADO', label: 'Mestrado' },
    { value: 'DOUTORADO', label: 'Doutorado' }
  ],

  estados: [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' }
  ],
  meses: [
    { nome: 'Janeiro', valor: 0 },
    { nome: 'Fevereiro', valor: 1 },
    { nome: 'Março', valor: 2 },
    { nome: 'Abril', valor: 3 },
    { nome: 'Maio', valor: 4 },
    { nome: 'Junho', valor: 5 },
    { nome: 'Julho', valor: 6 },
    { nome: 'Agosto', valor: 7 },
    { nome: 'Setembro', valor: 8 },
    { nome: 'Outubro', valor: 9 },
    { nome: 'Novembro', valor: 10 },
    { nome: 'Dezembro', valor: 11 },
  ]
};
