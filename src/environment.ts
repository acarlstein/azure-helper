export function resolveEnvironmentVariables(text: string, isWindows: boolean): string {
  if (isWindows) {
      // Staring with the charater %, matches one or more characters, 
      // until ending with the character %. i.e.: %VARIABLE_NAME%
      const regex = /%([^%]+)%/g;
      return text.replace(regex, (_, name) => {
          return process.env[name] ?? name;
      });
  }
  const regexAlphaNumericStartingWithLetter = /(\$[a-zA-Z_]+[a-zA-Z0-9_]*)/g;
  return text.replace(regexAlphaNumericStartingWithLetter, (_, name) => {
      return process.env[name.substr(1)] ?? name;
  });
}