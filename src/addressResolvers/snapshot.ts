import { capture } from '@snapshot-labs/snapshot-sentry';
import { Address, graphQlCall, Handle, removeFalsyValues } from '../utils';
import { FetchError, isSilencedError } from './utils';

const HUB_URL = process.env.HUB_URL ?? 'https://hub.snapshot.org';
export const NAME = 'Snapshot';

export async function lookupAddresses(addresses: Address[]): Promise<Record<Address, Handle>> {
  try {
    const headers = { 'x-api-key': process.env.HUB_API_KEY ?? '' };
    const {
      data: {
        data: { users }
      }
    } = await graphQlCall(
      `${HUB_URL}/graphql`,
      `query users {
        users(where: {id_in: ["${addresses.join('","')}"]}) {
          id
          name
        }
      }`,
      {
        headers: removeFalsyValues(headers)
      }
    );
    return Object.fromEntries(users.filter(user => user.name).map(user => [user.id, user.name]));
  } catch (e) {
    if (!isSilencedError(e)) {
      capture(e, { input: { addresses } });
    }
    throw new FetchError();
  }
}

export async function resolveNames(): Promise<Record<Handle, Address>> {
  return {};
}
