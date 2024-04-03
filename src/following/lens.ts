import { capture } from '@snapshot-labs/snapshot-sentry';
import { Address, FetchError, isSilencedError } from '../addressResolvers/utils';
import { graphQlCall } from '../helpers/utils';

export const NAME = 'Lens';
const API_URL = 'https://api-v2.lens.dev/graphql';

async function getProfileIds(address: Address): Promise<string[]> {
  const {
    data: {
      data: {
        profiles: { items }
      }
    }
  } = await graphQlCall(
    API_URL,
    `query Profile {
      profiles(request: { where: { ownedBy: "${address}" } }) {
        items {
          id
        }
      }
    }`
  );

  return items.map(({ id }) => id);
}

export async function following(targetAddress: string): Promise<string[]> {
  try {
    const profileIds = await getProfileIds(targetAddress);

    if (profileIds.length === 0) return [];

    // TODO: Handle pagination, to fetch more than 50 followings per profile
    const result = await Promise.all(
      profileIds.flatMap(async profileId => {
        const {
          data: {
            data: {
              following: { items }
            }
          }
        } = await graphQlCall(
          API_URL,
          `query Following {
          following(request: { for: "${profileId}", limit: Fifty }) {
            items {
              handle {
                ownedBy
              }
            }
          }
        }`
        );

        return items.map(({ handle: { ownedBy } }) => ownedBy) as string[];
      })
    );

    return result.flat();
  } catch (e) {
    if (!isSilencedError(e)) {
      capture(e, { input: { addresses: targetAddress } });
    }

    throw new FetchError();
  }
}
