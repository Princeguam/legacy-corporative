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
    NotificationIDMissing: 1030,
    NotificationNotFound: 1031,
    MessageMissing: 1032,
    SubjectMissing: 1033,
    CategoryMissing: 1034,
    FeedbackIDMissing: 1035,
    FeedbackNotFound: 1036,
    FirstNameMissing: 1037,
    LastNameMissing: 1038,
    PhoneNoMissing: 1039,
    TempPasswordMising: 1040,
    FileMissing: 1041,
    BankNameMissing: 1042,
    BankAccountNumberMissing: 1043,
    BankAccountNameMissing: 1044,
    BankAccountAlreadyExist: 1045,
    BankAccountNumberAlreadyExist: 1046,
    OldPasswordMissing: 1047,
    NewPasswordMissing: 1048,
    DuesNotFound: 1049,
    ChargeNotFound: 1050,
    NameMissing: 1051,
    DescriptionMissing: 1052,
    DueDateMissing: 1053,
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
        case ErrorType.NotificationIDMissing:
            return {
                errorCode: type,
                message: "Notification ID Not Provided",
                statusCode: 400,
            };
        case ErrorType.NotificationNotFound:
            return {
                errorCode: type,
                message: "Notification Not Found",
                statusCode: 400,
            };
        case ErrorType.MessageMissing:
            return {
                errorCode: type,
                message: "Message Not Provided",
                statusCode: 400,
            };
        case ErrorType.SubjectMissing:
            return {
                errorCode: type,
                message: "Subject Not Provided",
                statusCode: 400,
            };
        case ErrorType.CategoryMissing:
            return {
                errorCode: type,
                message: "Category Not Provided",
                statusCode: 400,
            };
        case ErrorType.FeedbackIDMissing:
            return {
                errorCode: type,
                message: "Feedback ID Not Provided",
                statusCode: 400,
            };
        case ErrorType.FirstNameMissing:
            return {
                errorCode: type,
                message: "First Name Missing",
                statusCode: 400,
            };
        case ErrorType.LastNameMissing:
            return {
                errorCode: type,
                message: "Last Name Missing",
                statusCode: 400,
            };
        case ErrorType.PhoneNoMissing:
            return {
                errorCode: type,
                message: "Phone Number Missing",
                statusCode: 400,
            };
        case ErrorType.TempPasswordMising:
            return {
                errorCode: type,
                message: "Temp Password Not Loaded From env",
                statusCode: 400,
            };
        case ErrorType.FileMissing:
            return {
                errorCode: type,
                message: "File Missing",
                statusCode: 400,
            };
        case ErrorType.FeedbackNotFound:
            return {
                errorCode: type,
                message: "Feedback Not Found",
                statusCode: 400,
            };
        case ErrorType.DuesNotFound:
            return {
                errorCode: type,
                message: "Dues Not Found",
                statusCode: 400,
            };
        case ErrorType.ChargeNotFound:
            return {
                errorCode: type,
                message: "Charge Not Found For User",
                statusCode: 400,
            };
        case ErrorType.NameMissing:
            return {
                errorCode: type,
                message: "Name Not Provided",
                statusCode: 400,
            };
        case ErrorType.DescriptionMissing:
            return {
                errorCode: type,
                message: "Description Not Provided",
                statusCode: 400,
            };
        case ErrorType.DueDateMissing:
            return {
                errorCode: type,
                message: "Due Date Not Provided",
                statusCode: 400,
            };
        case ErrorType.BankNameMissing:
            return {
                errorCode: type,
                message: "Bank Account Name Missing",
                statusCode: 400,
            };
        case ErrorType.BankAccountNameMissing:
            return {
                errorCode: type,
                message: "Account Name Missing",
                statusCode: 400,
            };
        case ErrorType.BankAccountNumberMissing:
            return {
                errorCode: type,
                message: "Bank Account Number Missing",
                statusCode: 400,
            };
        case ErrorType.BankAccountAlreadyExist:
            return {
                errorCode: type,
                message: "Bank Account Number Missing",
                statusCode: 400,
            };
        case ErrorType.BankAccountNumberAlreadyExist:
            return {
                errorCode: type,
                message: "Bank Account Already Exist With The Account Number",
                statusCode: 400,
            };
        case ErrorType.OldPasswordMissing:
            return {
                errorCode: type,
                message: "Old Password Not Provided",
                statusCode: 400,
            };
        case ErrorType.NewPasswordMissing:
            return {
                errorCode: type,
                message: "New Password Not Provided",
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
