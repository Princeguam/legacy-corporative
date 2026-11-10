export function sendResponse(
    success: boolean,
    message: string,
    data: any | undefined,
    errorCode: number | undefined,
) {
    if (success) {
        return { success: true, message: message, data: data || null };
    } else {
        return {
            success: false,
            message: message,
            errorCode: errorCode || 1000,
        };
    }
}
