import { assert } from 'chai'
import Signature from '../src/data/traits/Signature'
import path from 'path'
import fs from 'fs'

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

    let signature = Signature(state, ['sender', 'recipient'])
    const sign = signature.generateSignature(privateKey)
    assert.isNotEmpty(sign)

    // Assert 4 successful attempts
    for (const i in [1, 2, 3, 4]) {
      assert.isOk(signature.verifySignature())
    }

    // Create another signature (it will have its own attempts counter)
    process.env.SECURE_ATTEMPTS = 1
    signature = Signature(state, ['sender', 'recipient'])
    const otherPrivateKey = fs.readFileSync(lukePrivateKeyPath, 'utf8')
    signature.generateSignature(otherPrivateKey)

    for (const i in [1, 2]) {
      assert.isNotOk(signature.verifySignature())
    }

    // Halt
    assert.throws(() => {
      signature.verifySignature()
    }, 'Security violation detected! Halting program!')
  })
})
