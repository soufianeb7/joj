/**
 * Base Block type from which other blocks derive. While you can build a naive
 * simple blockchain with these blocks, it won't be much use since it can't
 * store inforation. Blocks don't really have a constructor property, as it's
 * mean to be abstract
 *
 * @param {string} previousHash Reference to the previous block in the chain
 * @return {Block} Newly created block with its own computed hash
 */
const Block = (previousHash = '') => {
  // Public interface
  const state = {
    previousHash,
    timestamp: Date.now(),
    hash: '',
    nonce: 0
  }
  return state
}

export default Block