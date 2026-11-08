export const ErrorType = {
    PasswordMissing: 1001,
    EmailMissing: 1002,
    AuthorizationMissing: 1003,
    AuthorizationExpired: 1004,
    AuthorizationInvalid: 1005,
    EmailAlreadyExist: 1006,
    UsernameAlreadyExist: 1007,
    InvalidRole: 1008,
    UsernameOrEmailUnavailable: 1009,
    IncorrectPassword: 1010,
    UserUnavailable: 1011,
    NotAuthorized: 1012,
    UserDeactivated: 1013,
    InvalidRefreshToken: 1014,
};

interface ErrorResponse {
    errorCode: number;
    message: string;
    statusCode: number;
}

export function HandleServerError(type: number): ErrorResponse {
    switch (type) {
        case ErrorType.PasswordMissing:
            return {
                errorCode: type,
                message: "No Password Provided",
                statusCode: 400,
            };
        case ErrorType.EmailMissing:
            return {
                errorCode: type,
                message: "No Email Provided",
                statusCode: 400,
            };
        case ErrorType.AuthorizationMissing:
            return {
                errorCode: type,
                message: "No Authorization Token Provided",
                statusCode: 400,
            };
        case ErrorType.AuthorizationExpired:
            return {
                errorCode: type,
                message: "Authorization Token Expired",
                statusCode: 400,
            };
        case ErrorType.AuthorizationInvalid:
            return {
                errorCode: type,
                message: "Invalid Authorization Token",
                statusCode: 400,
            };
        case ErrorType.EmailAlreadyExist:
            return {
                errorCode: type,
                message: "Email Already Exist",
                statusCode: 409,
            };
        case ErrorType.UsernameAlreadyExist:
            return {
                errorCode: type,
                message: "Username Already Exist",
                statusCode: 409,
            };
        case ErrorType.UsernameOrEmailUnavailable:
            return {
                errorCode: type,
                message: "Username or Email Unavailable",
                statusCode: 400,
            };
        case ErrorType.IncorrectPassword:
            return {
                errorCode: type,
                message: "Incorrect Password",
                statusCode: 400,
            };
        case ErrorType.UserUnavailable:
            return {
                errorCode: type,
                message: "User Unavailable",
                statusCode: 400,
            };
        case ErrorType.NotAuthorized:
            return {
                errorCode: type,
                message: "User Not Authorized",
                statusCode: 400,
            };
        case ErrorType.UserDeactivated:
            return {
                errorCode: type,
                message: "User Deactivated",
                statusCode: 400,
            };
        case ErrorType.InvalidRefreshToken:
            return {
                errorCode: type,
                message: "Invalid Refresh Token",
                statusCode: 400,
            };
        default:
            return {
                errorCode: 1000,
                message: "An unexpected error occured",
                statusCode: 500,
            };
    }
}
