import Swal, { SweetAlertIcon } from 'sweetalert2';

/**
 * Exibe um alerta padrão do projeto.
 * @param title Título do alerta
 * @param text Texto do alerta
 * @param icon Ícone do alerta (success, error, warning, info, question)
 * @returns Promise<SweetAlertResult<any>>
 */
export function showAlert(title: string, text: string, icon: SweetAlertIcon = 'info', iconColor: string = "primary",
  iconHtml: string = "", animation: boolean = false,  width: string = '',
  preConfirm?: () => any | Promise<any>  // <-- novo parâmetro
) {
  const confirmButtonColor = getCssVariable('--bs-blue') || '#d33'; // fallback vermelho
  iconColor = getCssVariable(`--bs-${iconColor}`) || '#d33'; // fallback vermelho
  
  const baseConfig: any = {
    title,
    html: text,
    showCancelButton: true,
    confirmButtonText: '<i class="fa fa-check"></i>&nbsp;Confirmar',
    confirmButtonColor: confirmButtonColor,
    cancelButtonText: '<i class="fas fa-times"></i>&nbsp;Cancelar',
    animation,
    icon,
    iconColor,
  };

  if (iconHtml) {
    baseConfig.iconHtml = iconHtml;
  }

   if (width) {
    baseConfig.width = width;
  }

  if (preConfirm) {
    baseConfig.preConfirm = preConfirm;
  }

  return Swal.fire(baseConfig);
}

function getCssVariable(variableName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

// --bs-blue
