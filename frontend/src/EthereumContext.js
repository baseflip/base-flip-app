import { createContext } from 'react';

const EthereumContext = createContext({
  account: null,
  setAccount: () => {},
  signer: null,
  setSigner: () => {},
  error: null,
  setError: () => {},
});

export default EthereumContext;
