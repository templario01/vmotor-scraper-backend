import { Website } from '@prisma/client';
import { VehicleFactory } from './factories/vehicle.factory';
import { WebsiteFactory } from './factories/website.factory';
import { doRequestToGraphqlServer } from './test-utils/integration-tests.utils';
import { buildGetVehiclesByAdvancedSearchQuery } from './test-utils/stubs';

describe('Get vehicles by advanced search', () => {
  let websiteFactory: WebsiteFactory;
  let vehicleFactory: VehicleFactory;
  let websiteOne: Website;
  let websiteTwo: Website;

  beforeAll(async () => {
    websiteFactory = new WebsiteFactory(global.prisma);
    vehicleFactory = new VehicleFactory(global.prisma);
    [websiteOne, websiteTwo] = await Promise.all([
      websiteFactory.make({ name: 'websiteOne' }),
      websiteFactory.make({ name: 'websiteTwo' }),
    ]);
    await vehicleFactory.makeMany(5, {
      website: { connect: { id: websiteOne.id } },
    });
  });

  describe('Happy Path', () => {
    it('should return status 200 and PaginatedVehicleEntity when the input is correct', async () => {
      const { websiteOneVehicles, websiteTwoVehicles } = {
        websiteOneVehicles: 6,
        websiteTwoVehicles: 5,
      };
      await Promise.all([
        vehicleFactory.makeMany(websiteOneVehicles, {
          description: 'mazda 3',
          location: 'lima',
          year: 2018,
          website: { connect: { id: websiteOne.id } },
        }),
        vehicleFactory.makeMany(websiteTwoVehicles, {
          description: 'mazda 3',
          location: 'lima',
          year: 2018,
          website: { connect: { id: websiteTwo.id } },
        }),
      ]);
      const buildGetVehiclesByAdvancedSearchQuery = ({
        take,
        after,
        city,
        searchName,
      }: {
        take?: number;
        after?: string;
        searchName?: string;
        city?: string;
      }) => ({
        query: `query {
          getVehiclesByAdvancedSearch(
            ${take ? 'take: ' + take + ',' : ''}
            ${after ? 'after: "' + after + '",' : ''}
            ${searchName ? 'searchName: "' + searchName + '",' : ''}
            ${city ? 'city: "' + city + '",' : ''}
          ){
            nodes{
              uuid
              externalId
              description
              price
              currency
              url
              year
              location
            }
            endCursor
            totalCount
          }
        }`,
      });

      const input = { take: 3, searchName: 'mazda 3 2018', city: 'lima' };
      const gqlRequestBody = buildGetVehiclesByAdvancedSearchQuery(input);

      const response = await doRequestToGraphqlServer(gqlRequestBody);
      const {
        body: {
          data: {
            getVehiclesByAdvancedSearch: { nodes },
          },
        },
      } = response;

      expect(response.status).toEqual(200);
      expect(nodes).toHaveLength(input.take);
      expect(response.body).toMatchObject({
        data: {
          getVehiclesByAdvancedSearch: {
            endCursor: nodes[nodes.length - 1].uuid,
            totalCount: websiteOneVehicles + websiteTwoVehicles,
            nodes,
          },
        },
      });
      expect(nodes).toSatisfyAll(
        ({ year, description }) => year === 2018 && /(mazda|3)/i.test(description),
      );
    });

    it('should return status 200 and PaginatedVehicleEntity with correct size of nodes when "searchName" and "city" are not defined', async () => {
      const input = { take: 3 };
      const gqlRequestBody = buildGetVehiclesByAdvancedSearchQuery(input);

      const response = await doRequestToGraphqlServer(gqlRequestBody);
      const {
        body: {
          data: {
            getVehiclesByAdvancedSearch: { nodes },
          },
        },
      } = response;

      expect(response.status).toEqual(200);
      expect(nodes).toHaveLength(input.take);
      expect(response.body).toMatchObject({
        data: {
          getVehiclesByAdvancedSearch: {
            endCursor: nodes[nodes.length - 1].uuid,
            totalCount: expect.any(Number),
            nodes,
          },
        },
      });
    });

    it('should return status 200 and property nodes of PaginatedVehicleEntity as empty when param "after" is invalid', async () => {
      await vehicleFactory.makeMany(10, {
        description: 'kia rio',
        location: 'lima',
        year: 2018,
        website: { connect: { id: websiteOne.id } },
      });

      const input = { take: 3, after: 'fake-uuid', searchName: 'kia rio', city: 'lima' };
      const gqlRequestBody = buildGetVehiclesByAdvancedSearchQuery(input);

      const response = await doRequestToGraphqlServer(gqlRequestBody);

      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject({
        data: {
          getVehiclesByAdvancedSearch: {
            endCursor: null,
            totalCount: expect.any(Number),
            nodes: [],
          },
        },
      });
    });
  });
});
