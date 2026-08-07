class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    details: undefined;
    constructor(statusCode: number, message: string, details = undefined) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ApiError