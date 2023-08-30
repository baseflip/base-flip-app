import { createContext } from 'react';

const EthereumContext = createContext({
  account: null,
  setAccount: () => {},
  signer: null,
  setSigner: () => {},
  error: null,
  setError: () => {},
  contractAddress: ""
});

export default EthereumContext;
