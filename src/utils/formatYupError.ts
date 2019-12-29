import { ValidationError } from "yup";

export const formatYupError = (err: ValidationError) => {
    const errors: Array<{path: string, message: string}> = []
    err.inner.forEach(err => {
        errors.push({
            path: err.path,
            message: err.message
        })
    });
    return errors
}