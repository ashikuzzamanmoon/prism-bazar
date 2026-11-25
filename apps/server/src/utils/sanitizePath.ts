import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';

export function NoLeadingSlashOrDot(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'noLeadingSlashOrDot',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: string, args: ValidationArguments) {
                    return typeof value === 'string' && !value.match(/^(\.\/|\/)/);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} should not start with "./" or "/"`;
                },
            },
        });
    };
}


