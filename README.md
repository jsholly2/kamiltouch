# Kamil Touch

Hello, this is my Celo 101 submission. It's an advertising dapp that allows people to post advertisements on the platform and pay a base fee for the advertisement. Other users who come to the platform can view the adverts and earn the process. I intend to build something similar to how Brave browser awards brave tokens to users who view advertisements. I will be glad to hear what you guys have to say about it.

Some things to note while testing the dapp

Advert creation cost a minimum of 2 CELO tokens. You can fund the advert with more tokens on the advert page.
Every view on an advert deducts 1 CELO from the advert balance. Once an advert is out of funds, it is automatically taken out of the dashboard.
A user can only view and advert once, any other attempt results to an error.
For every advert a user view, they earn .5 CELO and the remaining .5 CELO goes back to the platform.
Only the admin can view and withdraw funds accumulated in the platform.


Demo: 

# Install

```

npm install

```

or 

```

yarn install

```

# Start

```

npm run dev

```

# Build

```

npm run build

```
# Usage
1. Install the [CeloExtensionWallet](https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh?hl=en) from the google chrome store.
2. Create a wallet.
3. Go to [https://celo.org/developers/faucet](https://celo.org/developers/faucet) and get tokens for the alfajores testnet.
4. Switch to the alfajores testnet in the CeloExtensionWallet.
