function validateUserInput(username: string, password: string): boolean {
    let isBad =
        username.includes(" ") || password.includes(" ") || password.length < 6;
    return isBad;
}

module.exports = validateUserInput;
