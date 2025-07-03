import {describe} from 'node:test';
import {expect, test} from 'vitest';
import {TestUtils} from '../TestUtils/TestUtils';
import {SampleRouteType} from '../../enums/SampleRouteType';
import {Methods} from '../../enums/Methods';
import z from 'zod';

describe('DescriptionChecker', () => {
  test('Checks route descriptions', async ({expect}) => {
    const api = TestUtils.createOpenApi();
    const route = api.factory.createRoute({
      type: SampleRouteType.Public,
      method: Methods.GET,
      path: '/something',
      description: '',
      validators: {
        response: z.string().openapi({description: 'Testing'}),
      },
      handler: () => Promise.resolve('Something'),
    });

    // check
    expect(() => {
      api.addRoute(route);
    }).toThrowError(new Error('Description for /something is missing or too small'));

    route.description = 'Testing route description';
    expect(() => {
      api.addRoute(route);
    }).not.toThrowError();
  });

  test('Checks response validator descriptions', async ({expect}) => {
    const api = TestUtils.createOpenApi();
    const route = api.factory.createRoute({
      type: SampleRouteType.Public,
      method: Methods.GET,
      path: '/something',
      description: 'Testing route description',
      validators: {
        response: z.string(),
      },
      handler: () => Promise.resolve('Something'),
    });

    // check
    expect(() => {
      api.addRoute(route);
    }).toThrowError(new Error("Route 'GET:/something': responseValidator missing openapi description on field 'responseValidator'"));

    route.validators.response = route.validators.response.openapi({description: 'Something useful'});
    expect(() => {
      api.addRoute(route);
    }).not.toThrowError();
  });

  test('Checks body validator descriptions', async ({expect}) => {
    const api = TestUtils.createOpenApi();
    const route = api.factory.createRoute({
      type: SampleRouteType.Public,
      method: Methods.POST,
      path: '/something',
      description: 'Testing route description',
      validators: {
        response: z.string().openapi({description: 'Test description'}),
        body: z.object({
          name: z.string(),
        }),
      },
      handler: () => Promise.resolve('Something'),
    });

    // check
    expect(() => {
      api.addRoute(route);
    }).toThrowError(new Error("Route 'POST:/something': bodyValidator missing openapi description on field 'name'"));

    const route2 = api.factory.createRoute({
      type: SampleRouteType.Public,
      method: Methods.POST,
      path: '/something',
      description: 'Testing route description',
      validators: {
        response: z.string().openapi({description: 'Test description'}),
        body: z.object({
          name: z.string().openapi({description: 'Name'}),
        }),
      },
      handler: () => Promise.resolve('Something'),
    });
    expect(() => {
      api.addRoute(route2);
    }).not.toThrowError();
  });

  test('Checks validator descriptions in array items', async () => {
    const api = TestUtils.createOpenApi();
    const route = api.factory.createRoute({
      type: SampleRouteType.Public,
      method: Methods.POST,
      path: '/something',
      description: 'Testing route description',
      validators: {
        response: z.object({
          items: z.array(z.object({
            name: z.string(),
          })).openapi({description: 'Items of array'}),
        }).openapi({description: 'Test response'}),
      },
      handler: () => Promise.resolve({items: [{name: 'Something'}]}),
    });

    // check
    expect(() => {
      api.addRoute(route);
    }).toThrowError(new Error("Route 'POST:/something': responseValidator missing openapi description on field 'name'"));

    const route2 = api.factory.createRoute({
      type: SampleRouteType.Public,
      method: Methods.POST,
      path: '/something',
      description: 'Testing route description',
      validators: {
        response: z.object({
          items: z.array(z.object({
            name: z.string().openapi({description: 'Name of item'}), // <= change
          })).openapi({description: 'Items of array'}),
        }).openapi({description: 'Test response'}),
      },
      handler: () => Promise.resolve({items: [{name: 'Something'}]}),
    });
    expect(() => {
      api.addRoute(route2);
    }).not.toThrowError();
  });
});
