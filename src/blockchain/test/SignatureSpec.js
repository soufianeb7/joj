import CryptoSigner from '../src/data/CryptoSigner'
import Signature from '../src/data/Signature'
import { assert } from 'chai'
import fs from 'fs'
import path from 'path'

const ENCODING_HEX = 'hex'
const SIGN_ALGO = 'RSA-SHA256'

const signer = CryptoSigner({ algorithm: SIGN_ALGO, encoding: ENCODING_HEX })

describe('Signature', () => {
  it('Should return on verify after 3 attempts', () => {
    const base = path.join(__dirname, '../..', 'blockchain-wallets')
    const coinbaseprivateKeyPath = path.join(base, 'coinbase-private.pem')
    const coinbasepublicKeyPath = path.join(base, 'coinbase-public.pem')
    const lukePublicKeyPath = path.join(base, 'luke-public.pem')
    const lukePrivateKeyPath = path.join(base, 'luke-private.pem')

    const privateKey = fs.readFileSync(coinbaseprivateKeyPath, 'utf8')

    const state = {
      sender: fs.readFileSync(coinbasepublicKeyPath, 'utf8'),
      recipient: fs.readFileSync(lukePublicKeyPath, 'utf8')
    }

    let signature = Signature({ state, keys: ['sender', 'recipient'], signer })
    const sign = signature.generateSignature(privateKey)
    state.signature = sign
    assert.isNotEmpty(sign)

    // Assert 4 successful attempts
    for (const i in [1, 2, 3, 4]) {
      assert.isOk(signature.verifySignature())
    }

    // Create another signature (it will have its own attempts counter)
    process.env.SECURE_ATTEMPTS = 1
    signature = Signature({
      state,
      keys: ['sender', 'recipient'],
      signer
    })
    const otherPrivateKey = fs.readFileSync(lukePrivateKeyPath, 'utf8')
    state.signature = signature.generateSignature(otherPrivateKey)

    for (const i in [1, 2, 3]) {
      assert.isNotOk(signature.verifySignature())
    }

    // Halt
    assert.throws(() => {
      signature.verifySignature()
    }, 'Security violation detected! Halting program!')
  })
})
