import { createECDH, createCipher } from "crypto-browserify";
import { wallet } from "@cityofzion/neon-js";

export function crypto() {
  // Generate Alice's keys...
  const alice = createECDH("secp521r1");
  const aliceKey = alice.generateKeys();

  // Generate Bob's keys...
  const bob = createECDH("secp521r1");
  const bobKey = bob.generateKeys();

  // Exchange and generate the secret...
  console.log(`Alice key: ${aliceKey.toString("hex")}`);
  console.log(`Bob key: ${bobKey.toString("hex")}`);
}

export function generateSecret(pubB, secretA) {
  const a = createECDH("secp256r1");
  a.setPrivateKey(secretA, "hex");
  return a.computeSecret(pubB, "hex");
}

export function test() {
  // console.log("Person A address: AK2nJJpJr6o664CWJKi1QRXjqeic2zRp8y,
  // WIF: KxDgvEKzgSBPPfuVfw67oPQBSjidEiqTHURKSDL1R7yGaGYAeYnr");

  // console.log("Person B address: AU4iCQxqVMcn2AFbhQp9HG9jnQSKau93bn,
  // WIF: KwcZKTd1n1W5zmuxMijgHpemakGGzUBCzGcCmqrKrzHBWU7ctzn2");
  const privA = wallet.getPrivateKeyFromWIF("KxDgvEKzgSBPPfuVfw67oPQBSjidEiqTHURKSDL1R7yGaGYAeYnr");
  const pubA = wallet.getPublicKeyFromPrivateKey(privA);

  const privB = wallet.getPrivateKeyFromWIF("KwcZKTd1n1W5zmuxMijgHpemakGGzUBCzGcCmqrKrzHBWU7ctzn2");
  const pubB = wallet.getPublicKeyFromPrivateKey(privB);

  const a = createECDH("secp256r1");
  a.setPrivateKey(privA, "hex");
  const b = createECDH("secp256r1");
  b.setPrivateKey(privB, "hex");
  const aSecret = a.computeSecret(pubB, "hex");
  console.log(`a secret: ${aSecret.toString("hex")}`);

  const bSecret = b.computeSecret(pubA, "hex");
  console.log(`b secret: ${bSecret.toString("hex")}`);

  const cipher = createCipher("aes-256-ctr", bSecret);
  let crypted = cipher.update("hello there ... :) ", "utf8", "hex");
  crypted += cipher.final("hex");
  console.log(`crypted message :${crypted}`);

  const decipher = createCipher("aes-256-ctr", bSecret);
  let decrypted = decipher.update(crypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  console.log(`encrypt message :${decrypted}`);
}

export default crypto;
