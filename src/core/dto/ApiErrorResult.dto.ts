export class FieldErrorDto {
  public field: string | null = null;
  public message: string;

  constructor(message: string, field?: string) {
    this.message = message;
    if (field) this.field = field;
  }
}

export class ApiErrorResultDto {
  constructor(public errorsMessages: FieldErrorDto[]) {}
}
