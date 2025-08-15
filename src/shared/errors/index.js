class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }
}

class GameError extends AppError {
    constructor(message, code = 'GAME_ERROR') {
        super(message, 400);
        this.code = code;
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
        this.code = 'VALIDATION_ERROR';
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
        this.code = 'NOT_FOUND';
    }
}

class DatabaseError extends AppError {
    constructor(message, originalError = null) {
        super(message, 500);
        this.code = 'DATABASE_ERROR';
        this.originalError = originalError;
    }
}

module.exports = {
    AppError,
    GameError,
    ValidationError,
    NotFoundError,
    DatabaseError
};