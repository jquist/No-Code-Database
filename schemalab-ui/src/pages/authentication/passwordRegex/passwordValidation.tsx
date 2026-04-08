const patterns = {
  notEmpty: /^.+$/,
  minLength10: /^.{10,}$/,
  hasLower: /^(?=.*[a-z]).+$/,
  hasUpper: /^(?=.*[A-Z]).+$/,
  hasNumber: /^(?=.*[0-9]).+$/,
  hasSpecial: /^(?=.*[!@#$%^&*(),.?":{}|<>]).+$/,
};

export function testNonEmpty({password}: {password: string}) {
    if (!patterns.notEmpty.test(password)) {
        return false
    }
    return true;
}

export function testLength({password}: {password: string}) {
    if (!patterns.minLength10.test(password)) {
        return false
    }
    return true;
}

export function testHasLower({password}: {password: string}) {
    if (!patterns.hasLower.test(password)) {
        return false
    }
    return true;
}

export function testHasUpper({password}: {password: string}) {
    if (!patterns.hasUpper.test(password)) {
        return false
    }
    return true;
}

export function testHasNumber({password}: {password: string}) {
    if (!patterns.hasNumber.test(password)) {
        return false
    }
    return true;
}

export function testHasSpecial({password}: {password: string}) {
    if (!patterns.hasSpecial.test(password)) {
        return false
    }
    return true;
}