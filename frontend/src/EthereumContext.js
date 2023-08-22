import { createContext } from 'react';

const EthereumContext = createContext({
  account: null,
  setAccount: () => {},
  signer: null,
  setSigner: () => {},
});

export default EthereumContext;