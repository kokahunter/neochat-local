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

export function encrypt(pk, data) {
  return "E " + data;
}

export function decrypt(pk, iv, mac, data) {
  return "D " + data;
}

export function getPublicKey() {
  return "031a6c6fbbdf02ca351745fa86b9ba5a9452d785ac4f7fc2b7548ca2a46c4fcf4a";
}

export default crypto;
