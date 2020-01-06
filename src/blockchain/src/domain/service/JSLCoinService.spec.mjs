import Block from '../Block.mjs'
import Blockchain from '../Blockchain.mjs'
import JSLCoinService from './JSLCoinService.mjs'
import chai from 'chai'
import fs from 'fs'
import path from 'path'

const { assert } = chai

describe('JSLCoinService Spec', () => {
  it('Write a chain object to a file', () => {
    const compose = (...fns) => arg => fns.reduceRight((c, f) => f(c), arg)
    const decode = (charset = 'utf8') => buffer => (!buffer ? '' : buffer.toString(charset))
    const tokenize = str => (str || '').split(';')
    const parseBlocks = blocks => blocks.map(JSON.parse)
    const count = arr => (!arr ? 0 : arr.length)
    const read = fs.readFileSync

    const countBlocksInFile = compose(
      count, // #A
      parseBlocks, // #B
      tokenize,
      decode('utf8'), // #C      
      read // #D
    )

    const chain = new Blockchain()
    chain.push(new Block(chain.height() + 1, chain.top.hash, []))
    chain.push(new Block(chain.height() + 1, chain.top.hash, []))
    assert.equal(chain.height(), 3)
    const service = JSLCoinService(chain)
    const file = path.join(process.cwd(), 'src/domain/service', 'file.txt')
    const rawLedger = service.serializeLedger()
    try {
      fs.writeFileSync(file, rawLedger)
      const result = countBlocksInFile(file)
      assert.equal(result, chain.height())
    }
    finally {
      fs.unlink(file, err => {
        if (err) throw err
        console.log(`${file} was deleted`)
      })
    }
  })

  it('Uses Symbol.toStringTag', () => {
    const service = JSLCoinService(null)
    assert.equal(service.toString(), '[object JSLCoinService]')
  })
})
