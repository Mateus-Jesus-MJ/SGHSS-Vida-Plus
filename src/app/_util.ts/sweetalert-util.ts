import Swal, { SweetAlertIcon } from 'sweetalert2';

/**
 * Exibe um alerta padrão do projeto.
 * @param title Título do alerta
 * @param text Texto do alerta
 * @param icon Ícone do alerta (success, error, warning, info, question)
 * @returns Promise<SweetAlertResult<any>>
 */
export function showAlert(title: string, text: string, icon: SweetAlertIcon = 'info', iconColor :string = "primary") {
  const confirmButtonColor = getCssVariable('--bs-blue') || '#d33'; // fallback vermelho
  iconColor = getCssVariable(`--bs-${iconColor}`) || '#d33'; // fallback vermelho

  return Swal.fire({
    title,
    text,
    icon,
    iconColor: iconColor,
    showCancelButton: true,
    confirmButtonText: '<i class="fa fa-check"></i>&nbsp;Confirmar',
    confirmButtonColor: confirmButtonColor,
    cancelButtonText: '<i class="fas fa-times"></i>&nbsp;Cancelar',
  });
}

function getCssVariable(variableName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
}

// --bs-blue
