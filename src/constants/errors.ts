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
    UserNotFound: 1015,
    PhoneNoAlreadyExist: 1016,
    AmountMissing: 1017,
    AttachementMissing: 1018,
    InvalidInput: 1019,
    PaymentPeriodMissing: 1020,
    PaymentAlreadyExist: 1021,
    BankAccountNotFound: 1022,
    BankAccountIDMissing: 1023,
    PaymentIDMissing: 1024,
    PaymentNotFound: 1025,
    PaymentUpdateConflict: 1026,
    UserIDMissing: 1027,
    MemberIDMissing: 1028,
    MemberNotFound: 1029,
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
        case ErrorType.PhoneNoAlreadyExist:
            return {
                errorCode: type,
                message: "Phone Number ALready Exist",
                statusCode: 400,
            };
        case ErrorType.UserNotFound:
            return {
                errorCode: type,
                message: "User Not Found",
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
        case ErrorType.AmountMissing:
            return {
                errorCode: type,
                message: "Amount Not Provided",
                statusCode: 400,
            };
        case ErrorType.AttachementMissing:
            return {
                errorCode: type,
                message: "Attachment Not Provided",
                statusCode: 400,
            };
        case ErrorType.InvalidInput:
            return {
                errorCode: type,
                message: "Invalid Input",
                statusCode: 400,
            };
        case ErrorType.PaymentPeriodMissing:
            return {
                errorCode: type,
                message: "Payment Month Not Provided",
                statusCode: 400,
            };
        case ErrorType.PaymentAlreadyExist:
            return {
                errorCode: type,
                message: "Payment For Selected Month Already Exist",
                statusCode: 400,
            };
        case ErrorType.BankAccountNotFound:
            return {
                errorCode: type,
                message: "Bank Account Not Found",
                statusCode: 400,
            };
        case ErrorType.BankAccountIDMissing:
            return {
                errorCode: type,
                message: "Bank Account ID Missing",
                statusCode: 400,
            };
        case ErrorType.PaymentIDMissing:
            return {
                errorCode: type,
                message: "Payment ID Missing",
                statusCode: 400,
            };
        case ErrorType.PaymentNotFound:
            return {
                errorCode: type,
                message: "Payment Not Found",
                statusCode: 400,
            };
        case ErrorType.PaymentUpdateConflict:
            return {
                errorCode: type,
                message: "Payment Update Conflict",
                statusCode: 400,
            };
        case ErrorType.UserIDMissing:
            return {
                errorCode: type,
                message: "User ID Not Provided",
                statusCode: 400,
            };
        case ErrorType.MemberIDMissing:
            return {
                errorCode: type,
                message: "Member ID Not Provided",
                statusCode: 400,
            };
        case ErrorType.MemberNotFound:
            return {
                errorCode: type,
                message: "Member Not Found",
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
