const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
    networks: {
      development: {
        host: "127.0.0.1",
        port: 8545,
        network_id: "*", // Match any network id
      },
      cardona: {
        provider: () => new HDWalletProvider({
          privateKeys: ["0x6c8f989358264580ba59958871df0715d9717ad52c4ea08cdbe4dc79d37c0721"],
          providerOrUrl: "https://rpc.cardona.zkevm-rpc.com"
        }),
        network_id: 2442,     // Cardona's network id
        confirmations: 2,      // # of confirmations to wait between deployments
        timeoutBlocks: 200,    // # of blocks before a deployment times out
        skipDryRun: true       // Skip dry run before migrations? (default: false for public nets)
      },
    },
    compilers: {
      solc: {
        version: "0.8.9",    // Fetch exact version from solc-bin
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
        },
      },
    },
  };
  