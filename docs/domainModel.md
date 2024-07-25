# Domain Model

## Core Domain: Image Resolution and Manipulation

The core domain focuses on resolving and manipulating images for avatars and tokens. Avatars and Tokens are treated as separate aggregates, each with their own identifiers and sources.

   - Aggregate: Avatar
     - Entities:
       - Avatar
       - Identifier (Value Object)
     - Value Objects:
       - AvatarSource (ENS, Lens, Self.ID, Snapshot, etc.)
       - ImageSize

   - Aggregate: Token
     - Entities:
       - Token
       - ContractAddress (Value Object)
     - Value Objects:
       - TokenSource (TrustWallet, etc.)
       - ImageSize

   - Services:
     - ImageResolutionService
     - ImageResizingService
     - CachingService

## Supporting Subdomains:

### Identity Resolution

The Identity Resolution subdomain handles various types of identifiers supported by Stamp.

   - Service: IdentifierResolutionService
   - Entities:
     - EthereumAddress
     - ENSName
     - CAIP10Identifier
     - EIP3770Address
     - DecentralizedIdentifier
     - StarknetDomain

### Resolver Management

The Resolver Management subdomain orchestrates different resolvers to fetch images from various sources.

   - Service: ResolverOrchestrationService
   - Entities:
     - Resolver (ENS, Lens, Self.ID, Snapshot, TrustWallet, Starknet, Farcaster, Blockie, Jazzicon)

### Caching

The Caching subdomain manages the two-level caching strategy.

   - Service: CacheManagementService
   - Entities:
     - CachedImage
     - CacheKey

### API

The API subdomain handles incoming requests and generates appropriate responses.

   - Service: APIService
   - Value Objects:
     - StampURL
     - APIResponse

Questions for clarification:

- How does the system handle prioritization of different resolvers? Is there a specific order or fallback mechanism?

## Ubiquitous Language Glossary

### Core Concepts

- **Stamp**: A service for resolving and resizing Web3 avatar and token images.
- **Avatar**: An image representing a user's identity in Web3 applications.
- **Token**: An image representing a cryptocurrency or digital asset.
- **Identifier**: A unique string used to locate an avatar or token image (e.g., Ethereum address, ENS name).
- **Resolver**: A component responsible for fetching images from a specific source.
- **Image Resolution**: The process of finding and retrieving the correct image based on an identifier.
- **Image Resizing**: The process of adjusting the dimensions of an image.

### Image Types

- **Avatar Image**: An image representing a user's identity.
- **Token Image**: An image representing a cryptocurrency or digital asset.

### Identifiers

- **Ethereum Address**: A 42-character hexadecimal address used on the Ethereum blockchain.
- **ENS Name**: A human-readable domain name for Ethereum addresses (e.g., example.eth).
- **CAIP-10 Identifier**: A blockchain-agnostic identifier format.
- **EIP-3770 Address**: A prefixed address format for specifying the network (e.g., eth:0x...).
- **Decentralized Identifier (DID)**: A W3C standard for verifiable, decentralized digital identity.
- **Starknet Domain**: A domain name for Starknet addresses.

### Resolvers

- **ENS Resolver**: Fetches avatar images associated with Ethereum Name Service (ENS) domains.
- **Lens Resolver**: Retrieves avatar images from the Lens Protocol.
- **Self.ID Resolver**: Obtains avatar images from Self.ID profiles.
- **Snapshot Resolver**: Fetches avatar images associated with Snapshot profiles.
- **TrustWallet Resolver**: Retrieves token images from the Trust Wallet Assets repository.
- **Starknet Resolver**: Obtains avatar images for Starknet addresses.
- **Farcaster Resolver**: Fetches avatar images from Farcaster profiles.
- **Blockie Resolver**: Generates a default blockie image as a fallback.
- **Jazzicon Resolver**: Generates a default jazzicon image as a fallback.

### Caching

- **Base Image**: The original, full-size image fetched from a resolver.
- **Resized Image**: A version of the base image adjusted to specific dimensions.
- **Cache Key**: A unique identifier used to store and retrieve cached images.
- **Cache-buster**: A parameter used to bypass the cache and force a fresh image fetch.

### API

- **Stamp URL**: The URL structure used to request avatar or token images (e.g., cdn.stamp.fyi/{type}/{identifier}).
- **Type**: Specifies whether the request is for an avatar or a token image.
- **Size Parameter**: URL parameter used to specify desired image dimensions (e.g., s, w, h).

### Services

- **Image Resolution Service**: Coordinates the process of finding the correct image using various resolvers.
- **Image Resizing Service**: Handles the adjustment of image dimensions as requested.
- **Caching Service**: Manages the storage and retrieval of both base and resized images.
- **API Service**: Handles incoming requests and generates appropriate responses.
