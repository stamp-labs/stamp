# Stamp

[![codecov](https://codecov.io/gh/snapshot-labs/stamp/branch/master/graph/badge.svg?token=N9IMKE41RA)](https://codecov.io/gh/snapshot-labs/stamp)

## Introduction

Stamp is a powerful and flexible service for resolving and resizing Web3 avatar and token images. It provides a simple, unified API to fetch and manipulate images associated with various blockchain identities and tokens across different networks and protocols. Whether you're building a dApp, a wallet interface, or any Web3-enabled application, Stamp simplifies the process of displaying user avatars and token icons.

## Key Features

- Resolves avatars from multiple sources (ENS, Lens, Self.ID, Snapshot, etc.)
- Supports various identifier types (Ethereum addresses, ENS names, CAIP-10, EIP-3770, DIDs, Starknet domains)
- On-the-fly image resizing
- Caching mechanism for improved performance
- Easy-to-use URL-based API

## Usage

Integrating Stamp into your project is straightforward. Simply use a valid Stamp URL to display an avatar or token image:

```html
<img src="https://cdn.stamp.fyi/avatar/0xeF8305E140ac520225DAf050e2f71d5fBcC543e7" alt="User Avatar" />
```

### URL Structure

The general structure of a Stamp URL is as follows:

```
cdn.stamp.fyi/{type}/{identifier}?{params}
```

- `{type}`: Either `avatar` or `token`
- `{identifier}`: The address, name, or identifier for the avatar/token
- `{params}`: Optional parameters for image manipulation

#### Examples

Avatar by Ethereum address:
```
cdn.stamp.fyi/avatar/0xeF8305E140ac520225DAf050e2f71d5fBcC543e7
```

Token by contract address:
```
cdn.stamp.fyi/token/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e
```

Avatar by ENS name:
```
cdn.stamp.fyi/avatar/fabien.eth
```

Avatar with custom size:
```
cdn.stamp.fyi/avatar/0xeF8305E140ac520225DAf050e2f71d5fBcC543e7?s=160
```

### Supported Identifiers

Stamp supports various identifier types:

- Ethereum addresses (case insensitive)
- ENS names
- CAIP-10 identifiers
- EIP-3770 addresses
- DIDs (Decentralized Identifiers)
- Starknet domains

### Parameters

You can customize the returned image using URL parameters:

- `s`: Set both width and height (e.g., `s=160`)
- `w`: Set width (e.g., `w=160`)
- `h`: Set height (e.g., `h=240`)
- `cb`: Cache-busting parameter to force a refresh (e.g., `cb=1`)

## Resolvers

Stamp uses multiple resolvers to fetch avatar and token images:

- [ENS Avatar](/src/resolvers/ens.ts)
- [Lens](/src/resolvers/lens.ts)
- [Self.ID](/src/resolvers/selfid.ts)
- [Snapshot](/src/resolvers/snapshot.ts)
- [TrustWallet Assets Info](/src/resolvers/trustwallet.ts)
- [Starknet](/src/resolvers/starknet.ts)
- [Farcaster](/src/resolvers/farcaster.ts)
- [Blockie (fallback)](/src/resolvers/blockie.ts)
- [Jazzicon (fallback)](/src/resolvers/jazzicon.ts)

For detailed information on each resolver, please check the corresponding files in the `/src/resolvers/` directory.

## Integrations

Stamp is currently integrated with several popular Web3 projects:

- [Snapshot](http://snapshot.org)
- [Parcel](https://parcel.money)
- [Hey](https://hey.xyz)
- [RSS3](https://rss3.io)
- [Cirip](https://cirip.io)
- [Tape](https://tape.xyz)

We welcome new integrations! If you're using Stamp in your project, feel free to add it to this list.

## Contributing

We welcome contributions to Stamp! If you have ideas for improvements or have found a bug, please open an issue or submit a pull request.

## Local Development

Clone and install the repository:

```
git clone https://github.com/snapshot-labs/stamp.git
cd stamp
yarn install
```

> [!WARNING]  
> If you encounter `ERR! install response status 404 Not Found on https://github.com/Automattic/node-canvas ...`, try using Node.js version 21. This issue is related to dependency build targets and will be addressed later.

Set up the environment by creating a `.env` file in the root directory. Refer to `test/.env.test` for required variables. Then start Redis:

```
docker run -d -p 6379:6379 redis
```

Run the development server:

```
yarn dev
```

## Building and Production

To build the project and start the production server:

```
yarn build
yarn start
```

## Testing

Run all tests:

```
yarn test
```

For integration or e2e tests only:

```
yarn test:integration
yarn test:e2e
```

## License

Stamp is released under the [MIT License](LICENSE).
