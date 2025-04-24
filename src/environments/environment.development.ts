export const environment = {
  production: false,
  apiPrincipal: 'http://localhost:3000/',
  apiConsultaCEP: 'https://viacep.com.br/ws/',
  apiConsultaEstadosMunicipios: 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/',

  firebaseConfig : {
    apiKey: "AIzaSyAyzWdAsNAD5EL7Bv0I1Ld_mhlJH0EIKT0",
    authDomain: "sghss-vidaplus.firebaseapp.com",
    projectId: "sghss-vidaplus",
    storageBucket: "sghss-vidaplus.firebasestorage.app",
    messagingSenderId: "901401357138",
    appId: "1:901401357138:web:0c46f5072e4981c4f9688b"
  },












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
  ]
};
