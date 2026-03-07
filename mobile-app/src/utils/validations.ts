export interface RegisterErrors {
    fullName?: string;
    nic?: string;
    mobile?: string;
    email?: string;
    assessmentNumber?: string;
    division?: string;
    gnDivision?: string;
    homeLocation?: string;
    password?: string;
    confirmPassword?: string;
    agreed?: string;
}

export const validateStep1 = (
    fullName: string,
    nic: string,
    mobile: string,
    email: string
): { isValid: boolean; errors: RegisterErrors } => {
    const errors: RegisterErrors = {};

    if (!fullName.trim()) {
        errors.fullName = 'Full Name is required';
    } else {
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(fullName.trim())) {
            errors.fullName = 'Full Name can only contain letters';
        }
    }

    if (!nic.trim()) {
        errors.nic = 'NIC Number is required';
    } else {
        const nicRegex = /^(\d{9}[Vv]|\d{12})$/;
        if (!nicRegex.test(nic.trim())) {
            errors.nic = 'Please enter a valid NIC number';
        }
    }

    if (!mobile.trim()) {
        errors.mobile = 'Mobile Number is required';
    } else {
        const mobileRegex = /^0[1-9]\d{8}$/;
        if (!mobileRegex.test(mobile.trim())) {
            errors.mobile = 'Please enter a valid 10-digit mobile number';
        }
    }

    if (!email.trim()) {
        errors.email = 'Email is required';
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            errors.email = 'Please enter a valid email address';
        }
    }

    return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateStep2 = (
    assessmentNumber: string,
    division: any,
    gnDivision: any,
    homeLocation: string,
    latitude: number | null,
    longitude: number | null
): { isValid: boolean; errors: RegisterErrors } => {
    const errors: RegisterErrors = {};

    if (!assessmentNumber.trim()) {
        errors.assessmentNumber = 'Assessment Number is required';
    }

    if (!division) {
        errors.division = 'Division is required';
    }

    if (!gnDivision) {
        errors.gnDivision = 'Grama Niladhari Division is required';
    }

    if (!homeLocation.trim() || latitude === null || longitude === null) {
        errors.homeLocation = 'Home Location is required. Please pick on map or use GPS.';
    }

    return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateStep3 = (
    password: string,
    confirmPassword: string,
    agreed: boolean
): { isValid: boolean; errors: RegisterErrors } => {
    const errors: RegisterErrors = {};
    const strongPassword = /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!password.trim()) {
        errors.password = 'Password is required';
    } else if (!strongPassword.test(password.trim())) {
        errors.password = 'At least 8 chars, include a number and a special character';
    }

    if (!confirmPassword.trim()) {
        errors.confirmPassword = 'Please confirm your password';
    } else if (password.trim() !== confirmPassword.trim()) {
        errors.confirmPassword = 'Passwords do not match';
    }

    if (!agreed) {
        errors.agreed = 'You must agree to the Terms of Service and Privacy Policy';
    }

    return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateForgotPassword = (email: string): { isValid: boolean; errors: RegisterErrors } => {
    const errors: RegisterErrors = {};

    if (!email.trim()) {
        errors.email = 'Email is required';
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            errors.email = 'Please enter a valid email address';
        }
    }

    return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateResetPassword = (
    password: string,
    confirmPassword: string
): { isValid: boolean; errors: RegisterErrors } => {
    const errors: RegisterErrors = {};
    const strongPassword = /^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!password.trim()) {
        errors.password = 'Password is required';
    } else if (!strongPassword.test(password.trim())) {
        errors.password = 'At least 8 chars, include a number and a special character';
    }

    if (!confirmPassword.trim()) {
        errors.confirmPassword = 'Please confirm your password';
    } else if (password.trim() !== confirmPassword.trim()) {
        errors.confirmPassword = 'Passwords do not match';
    }

    return { isValid: Object.keys(errors).length === 0, errors };
};
