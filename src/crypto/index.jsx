export function encrypt(pk, data) {
  return `E ${data}`;
}

export function decrypt(pk, iv, mac, data) {
  return `D ${data}`;
}

export function getPublicKey() {
  return "031a6c6fbbdf02ca351745fa86b9ba5a9452d785ac4f7fc2b7548ca2a46c4fcf4a";
}

export default encrypt;
