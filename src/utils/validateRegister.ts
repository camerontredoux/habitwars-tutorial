import UserArguments from "../types/UserArguments";

export const validateRegister = (options: UserArguments) => {
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "This is an invalid email address.",
      },
    ];
  }
  if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "This is an invalid username.",
      },
    ];
  }
  if (options.username.length === 0) {
    return [
      {
        field: "username",
        message: "The username cannot be empty.",
      },
    ];
  }
  if (options.password.length < 8) {
    return [
      {
        field: "password",
        message: "Password must be at least 8 characters.",
      },
    ];
  }
  return null;
};
