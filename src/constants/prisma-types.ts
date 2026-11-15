export const users = {
    id: true,
    firstName: true,
    middleName: true,
    lastName: true,
    email: true,
    phoneNo: true,
    dob: true,
    address: true,
    state: true,
    lga: true,
    gender: true,
    passport: true,
    role: true,
    isAdmin: true,
    isDeleted: true,
    created: true,
    updated: true,
};

export const bankAccount = {
    id: true,
    bankName: true,
    accountName: true,
    accountNumber: true,
    isActive: true,
};

export const paymentTransactions = {
    id: true,
    bankAccountId: true,
    userId: true,
    status: true,
    type: true,
    amount: true,
    currency: true,
    note: true,
    source: true,
    attachmentUrl: true,
    reviewedById: true,
    period: true,
    depositedAt: true,
    reviewedAt: true,
    created: true,
    updated: true,
    depositedBy: {
        select: users,
    },
    reviewedBy: {
        select: users,
    },
    bankAccount: {
        select: bankAccount,
    },
};
