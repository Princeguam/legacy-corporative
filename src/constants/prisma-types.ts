export const users = {
    id: true,
    firstName: true,
    middleName: true,
    lastName: true,
    fullName: true,
    email: true,
    phoneNo: true,
    dob: true,
    occupation: true,
    nextOfKinName: true,
    nextOfKinRelationship: true,
    nextOfKinPhone: true,
    emergencyContact: true,
    emergencyContactPhone: true,
    emergencyContactRelationship: true,
    address: true,
    state: true,
    lga: true,
    gender: true,
    passport: true,
    role: true,
    isAdmin: true,
    isDeleted: true,
    isActive: true,
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

export const charges = {
    id: true,
    userId: true,
    reason: true,
    status: true,
    amount: true,
    description: true,
    period: true,
    meetingId: true,
    issuedBy: true,
    waivedBy: true,
    waivedAt: true,
    created: true,
    updated: true,
};

export const notifications = {
    id: true,
    userId: true,
    type: true,
    title: true,
    body: true,
    link: true,
    readAt: true,
    created: true,
};

export const feedback = {
    id: true,
    userId: true,
    subject: true,
    message: true,
    category: true,
    created: true,
    updated: true,
    member: {
        select: users,
    },
    images: {
        select: {
            id: true,
            imageUrl: true,
            caption: true,
        },
    },
};

export const duesTypes = {
    id: true,
    createdById: true,
    name: true,
    description: true,
    amount: true,
    dueDate: true,
    isActive: true,
    created: true,
    updated: true,
    createdBy: {
        select: {
            id: true,
            fullName: true,
            firstName: true,
            lastName: true,
            middelName: true,
            passport: true,
            email: true,
        },
    },
};

export const attendance = {
    id: true,
    meetingId: true,
    userId: true,
    status: true,
    joinedAt: true,
    joinCount: true,
    created: true,
    updated: true,
    user: {
        select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            fullName: true,
            passport: true,
            gender: true,
        },
    },
};
export const meetings = {
    id: true,
    title: true,
    meetingUrl: true,
    heldAt: true,
    created: true,
    updated: true,
    attendance: {
        select: attendance,
    },
};
