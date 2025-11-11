const CarService = require('../../../../src/core/car/CarService');
const Car = require('../../../../src/core/car/Car');

describe('CarService', () => {
    let carService;

    beforeEach(() => {
        carService = new CarService();
    });

    describe('validateCarForGame', () => {
        test('should validate a correct car', () => {
            const car = new Car({
                make: 'Toyota',
                model: 'Corolla',
                country: 'Japon',
                modelDate: 2020,
                difficulty: 1
            });

            expect(() => carService.validateCarForGame(car)).not.toThrow();
        });

        test('should reject car with short make name', () => {
            const car = new Car({
                make: 'T',
                model: 'Corolla',
                country: 'Japon',
                modelDate: 2020,
                difficulty: 1
            });

            expect(() => carService.validateCarForGame(car)).toThrow('Nom de marque trop court');
        });

        test('should reject car with empty model', () => {
            const car = new Car({
                make: 'Toyota',
                model: '',
                country: 'Japon',
                modelDate: 2020,
                difficulty: 1
            });

            expect(() => carService.validateCarForGame(car)).toThrow('Nom de modèle trop court');
        });
    });
});