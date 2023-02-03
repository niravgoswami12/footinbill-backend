export const randomNumber = (length = 4) => {
  let output = '';

  const characters = '0123456789';

  for (let i = 0; i < length; i++) {
    output += characters[Math.floor(Math.random() * length)];
  }

  return output;
};
