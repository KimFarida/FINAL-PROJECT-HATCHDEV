export class CustomError extends Error {
    statusCode: number;
    errorCode?: string;

    constructor(
        message: string, 
        statusCode: number = 500, 
        errorCode?: string
    ) {
        super(message);
        this.name = 'CustomError';
        this.statusCode = statusCode;
        this.errorCode = errorCode;

        // Maintains proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}