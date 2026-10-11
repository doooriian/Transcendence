const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const EMAIL_MAX_LENGTH = 254;

// Allows letters, numbers and underscores only
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

// Basic email format: local part, @, domain and extension
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates and normalizes a username.
 *
 * Trims surrounding whitespace and ensures the username
 * respects the allowed length and character format.
 */
function validateUsername(username) {
  if (typeof username !== "string") {
    return {
      error: "Username must be a string",
    };
  }

  const normalizedUsername = username.trim();

  if (
    normalizedUsername.length < USERNAME_MIN_LENGTH ||
    normalizedUsername.length > USERNAME_MAX_LENGTH
  ) {
    return {
      error: `Username must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters`,
    };
  }

  if (!USERNAME_REGEX.test(normalizedUsername)) {
    return {
      error: "Username can only contain letters, numbers and underscores",
    };
  }

  return {
    username: normalizedUsername,
  };
}

/**
 * Validates and normalizes an email address.
 *
 * Trims surrounding whitespace and converts the email to lowercase.
 * Returns an error when the email format or length is invalid.
 */
function validateEmail(email) {
  if (typeof email !== "string") {
    return {
      error: "Email must be a string",
    };
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (
    normalizedEmail.length === 0 ||
    normalizedEmail.length > EMAIL_MAX_LENGTH ||
    !EMAIL_REGEX.test(normalizedEmail)
  ) {
    return {
      error: "Invalid email address",
    };
  }

  return {
    email: normalizedEmail,
  };
}

/**
 * Validates a password.
 *
 * Ensures the password is a string and respects the allowed length.
 */
function validatePassword(password) {
  if (typeof password !== "string") {
    return {
      error: "Password must be a string",
    };
  }

  if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    return {
      error: `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`,
    };
  }

  return {
    password,
  };
}

/**
 * Validates and normalizes registration input.
 *
 * Checks the username, email and password before creating a user.
 */
function validateRegisterInput(username, email, password) {
  const usernameValidation = validateUsername(username);

  if (usernameValidation.error) {
    return usernameValidation;
  }

  const emailValidation = validateEmail(email);

  if (emailValidation.error) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password);

  if (passwordValidation.error) {
    return passwordValidation;
  }

  return {
    username: usernameValidation.username,
    email: emailValidation.email,
    password: passwordValidation.password,
  };
}

/**
 * Validates and normalizes login input.
 *
 * Checks the email and password before authentication.
 */
function validateLoginInput(email, password) {
  const emailValidation = validateEmail(email);

  if (emailValidation.error) {
    return emailValidation;
  }

  const passwordValidation = validatePassword(password);

  if (passwordValidation.error) {
    return passwordValidation;
  }

  return {
    email: emailValidation.email,
    password: passwordValidation.password,
  };
}

export { validateUsername, validateEmail, validateRegisterInput, validateLoginInput };
