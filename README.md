# Stamp
Resolve and resize web3 avatar and token images.

### Usage
Simply use a valid Stamp URL to display an avatar:

https://stamp.fyi/avatar/0xeF8305E140ac520225DAf050e2f71d5fBcC543e7

```
<img src="https://stamp.fyi/avatar/0xeF8305E140ac520225DAf050e2f71d5fBcC543e7" />
```

### URL structure
stamp.fyi/**{type}**/**{identifier}**?**{params}**  
stamp.fyi/**avatar**/**0xeF8305E140ac520225DAf050e2f71d5fBcC543e7**?**s=140**

### Type
The type is either avatar or token.

#### Examples
stamp.fyi/**avatar**/0xeF8305E140ac520225DAf050e2f71d5fBcC543e7  
stamp.fyi/**token**/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e

### Identifier
The identifier can be an address (case insensitive), ENS name, CAIP-10, EIP-3770 or DID.

#### Examples
stamp.fyi/avatar/**0xeF8305E140ac520225DAf050e2f71d5fBcC543e7**  
stamp.fyi/avatar/**fabien.eth**  
stamp.fyi/token/**eth:0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e**  
stamp.fyi/token/**eip155:1:0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e**

### Params
With the params you can define the size of the image returned.

#### Examples
stamp.fyi/avatar/0xeF8305E140ac520225DAf050e2f71d5fBcC543e7?**s=160**
stamp.fyi/avatar/0xeF8305E140ac520225DAf050e2f71d5fBcC543e7?**w=160&h=240**

### Resolvers

#### [ENS avatar](/src/resolvers/ens.ts)
#### [TrustWallet Assets Info](/src/resolvers/trustwallet.ts)
#### [Blockie](/src/resolvers/blockie.ts)
#### [Snapshot](/src/resolvers/snapshot.ts)

### License

[MIT](LICENSE).
