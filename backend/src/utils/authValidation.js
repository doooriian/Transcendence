const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

function validateAuthInput(username, password) {
  if (typeof username !== "string" || typeof password !== "string") {
    return {
      error: "Username and password must be strings",
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

  if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    return {
      error: `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters`,
    };
  }

  return {
    username: normalizedUsername,
    password,
  };
}

export default validateAuthInput;
