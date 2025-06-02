import { Request, Response, NextFunction } from "express";

// ApiError Class
class ApiError extends Error {
    statusCode: number;
    data: null;
    success: false;
    errors: string[];

    constructor(statusCode: number, message = "Something Went Wrong", errors: string[] | string = [], stack = "") {
        super(message);

        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.message = message;
        this.errors = Array.isArray(errors) ? errors : [errors];

        if (stack) {
            this.stack = stack;
        } else if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    toJSON() {
        const { statusCode, data, success, errors, message } = this;
        return { statusCode, data, success, errors, message };
    }
}

// asyncHandler Wrapper
const asyncHandler = (requestHandler: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        return Promise.resolve(requestHandler(req, res, next)).catch(next);
    };
};

// ApiResponse Class (your code is fine here)
class ApiResponse<T> {
    statusCode: number;
    data: T;
    message: string;
    success: boolean;

    constructor(statusCode: number, data: T, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export { ApiError, ApiResponse, asyncHandler };
