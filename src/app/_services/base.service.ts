import { HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { of, throwError } from "rxjs";
import { environment } from "../../environments/environment";

export abstract class BaseService {

    protected serviceError(response: Response | any) {
        let customError: string[] = [];
        if (response instanceof HttpErrorResponse) {

            if (response.statusText === "Unknown Error") {
                customError.push("Ocorreu um erro desconhecido");
                return throwError(() => customError);
            }
        }

        if (response.status === 500) {
            customError.push("Ocorreu um erro no processamento, tente novamente mais tarde ou contate o nosso suporte");
        }

        if (response.status === 403) {
            customError.push("Você não possui permissão para realizar essa operação!");
        }

        if (response.name === "TimeoutError") {
            customError.push("O tempo de resposta fois mais longo que o esperado");
            response = { error: { erros: customError }};
        }

        customError.push(response.error)
        return throwError(() => customError);
    }
}
