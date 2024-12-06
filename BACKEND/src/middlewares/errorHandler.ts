import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { CustomError } from '../utils/customError';

const errorHandler: ErrorRequestHandler = (
    err: Error, 
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    console.error('Error occurred:', err);

    if (err instanceof CustomError) {
        res.status(err.statusCode).json({
            message: err.message,
            errorCode: err.errorCode
        });
        return;
    }

    // Default error handling for unexpected errors
    res.status(500).json({
        message: 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { 
            errorDetails: err.message 
        })
    });
};

export default errorHandler;