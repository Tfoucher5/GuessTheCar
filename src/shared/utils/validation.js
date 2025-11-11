const Joi = require('joi');
const { ValidationError } = require('../errors');

const schemas = {
    playerGuess: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .pattern(/^[a-zA-Z0-9\s-]+$/)
        .required()
        .messages({
            'string.pattern.base': 'La réponse ne peut contenir que des lettres, chiffres, espaces et tirets',
            'string.min': 'La réponse doit contenir au moins 1 caractère',
            'string.max': 'La réponse ne peut pas dépasser 50 caractères'
        }),

    userId: Joi.string()
        .pattern(/^\d+$/)
        .required()
        .messages({
            'string.pattern.base': 'L\'ID utilisateur doit être numérique'
        }),

    username: Joi.string()
        .trim()
        .min(1)
        .max(32)
        .required(),

    difficulty: Joi.number()
        .integer()
        .min(1)
        .max(3)
        .required(),

    attempts: Joi.number()
        .integer()
        .min(0)
        .max(100)
        .required(),

    time: Joi.number()
        .integer()
        .min(0)
        .required(),

    points: Joi.number()
        .min(0)
        .max(100)
        .required()
};

/**
 * Valide des données contre un schéma
 * @param {*} data - Données à valider
 * @param {Joi.Schema} schema - Schéma de validation
 * @returns {*} - Données validées
 * @throws {ValidationError} - En cas d'erreur de validation
 */
function validate(data, schema) {
    const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        const message = error.details.map(detail => detail.message).join(', ');
        throw new ValidationError(message);
    }

    return value;
}

/**
 * Valide une réponse de joueur
 */
function validatePlayerGuess(guess) {
    return validate(guess, schemas.playerGuess);
}

/**
 * Valide un ID utilisateur Discord
 */
function validateUserId(userId) {
    return validate(userId, schemas.userId);
}

/**
 * Valide un nom d'utilisateur
 */
function validateUsername(username) {
    return validate(username, schemas.username);
}

/**
 * Valide un niveau de difficulté
 */
function validateDifficulty(difficulty) {
    return validate(difficulty, schemas.difficulty);
}

/**
 * Middleware de validation pour Express
 */
function validationMiddleware(schema) {
    return (req, res, next) => {
        try {
            const validated = validate(req.body, schema);
            req.body = validated;
            next();
        } catch (error) {
            return res.status(400).json({
                error: 'Validation Error',
                message: error.message
            });
        }
    };
}

module.exports = {
    schemas,
    validate,
    validatePlayerGuess,
    validateUserId,
    validateUsername,
    validateDifficulty,
    validationMiddleware
};
