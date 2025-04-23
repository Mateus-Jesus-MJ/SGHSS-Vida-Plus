export class Estado {
    public id: number = 0;
    public nome: string = "";
    public sigla: string = "";
}

export class Municipo{
    public nome: string = "";    
    public estado!: Estado;
}