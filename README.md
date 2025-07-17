# Strap-on OpenAPI

Bring a fully-fledged, type-checked API to your app in just 5 minutes.

[What is Strap-On OpenAPI](#what-is-strap-on-openapi)

[Installation](#installation)

[Quick Start](#quick-start)

[Adding Routes](#adding-routes)

[Configuration](#configuration)

## Features
- Type-checked throughout
- Completely customizable and open for extension
- Not opinionated; solves only the problems it is supposed to
- Easy to test
- Includes two documentation generators (Swagger, Stoplight)
- TypeScript client generator included
- Since you have OpenAPI, you can generate clients for any language you want

## What is Strap-On OpenAPI?

OpenAPI is a standard for documenting your REST APIs. It's similar to JSDoc generators but with one major difference: it uses schemas that can be strictly typed and used for code generation.

This allows you to quickly generate clients for your API in most languages—pretty neat, right? The problem is those schemas are not very human-friendly and are hard to fill out by hand.

Documentation generators for OpenAPI allow you to send sample requests to your API and conveniently publish documentation for consumers.

Now let's talk about Zod. Zod is a validation library that allows you to infer types from validators. If an object passes validation with Zod, you can be sure it contains certain fields—even at compile time.

Zod works so well that I stopped using classes for models and DTOs in my own projects: I simply infer types from validators.

You might have the same idea I had some time ago: why not combine Zod and OpenAPI and make our API absolutely type-checked both on the frontend and backend? That would be a blast!

Strap-On OpenAPI is a lightweight, non-opinionated framework that allows you to do exactly that. It's highly customizable and easy to use, while providing fully type-checked context. You can forget about those "any" types that pop up here and there in your APIs.

The framework doesn't have any predefined middlewares (I don't even use such a concept) or excessive code. It has a few built-in errors and validators which I found helpful, and even those are made with the same utilities that are available to you.

Simply put, Strap-On OpenAPI is the glue that ties together OpenAPI, Zod, and Openapi-TS. And you are in charge of how your API is shaped—that's what sets this framework apart from tools like `GraphQL` and `tRPC`.

You can check out some sample code here:
https://github.com/Freddis/strap-on-openapi-samples

## Disclaimer
Configuration is a bit clunky due to the huge amount of inferred types. But trust me, when you learn the basics (and there is no advanced level—it's really lightweight) you will be able to configure your API in just 5 minutes.

Keep in mind that in a real project, validators are defined in separate files and the production-grade code is significantly more elegant than what you see here in the documentation.

Normally, a route definition looks something like this:
```typescript
export const upsertWorkouts = openApi.factory.createRoute({
  method: OpenApiMethod.PUT,
  type: ApiRouteType.User,
  description: 'Updates or inserts workout for user',
  path: '/',
  validators: {
    body: workoutUpsertDtoValidator,
    response: workoutUpserResponseValidator
  },
  handler: async (ctx) => {
    const result = await ctx.services.models.workout.upsert(ctx.viewer.id, ctx.params.body.items);
    return {items: result};
  },
});
```

## Installation

```shell
npm install strap-on-openapi
```

## Quick Start
The idea behind Strap-On OpenAPI is that you don't need to bother with configuration right away. It is designed to be configured as you go. Fire it up, focus on your business logic, then add errors, routes, and contexts as you go.

Right now, Strap-On OpenAPI provides quickstart wrappers for Tanstack Start and Express.

### Express

```typescript
// file: index.ts
const app = express();
const openapi = OpenApi.create();
openapi.wrappers.express.createSwaggerRoute('/swagger', app);
openapi.wrappers.express.createOpenApiRootRoute(app);
app.listen(3000);
```
And that's it. No need for any initial configuration—you already have Swagger documentation at http://localhost:3000/swagger.

Of course, since we haven't added routes, any attempt to send a request to `/api/something` will result in one of the built-in errors, but the API is already working.

### Tanstack Start
Due to the slightly opinionated nature of Tanstack routing, we need more files:

Root Route:
```typescript
// file: src/routes/api.ts
// Since we're using file routing, it's important that it matches the base path, which defaults to /api
import {createServerFileRoute} from '@tanstack/react-start/server';
import {openapi} from '../backend/utils/openApiInstance';

const methods = openapi.wrappers.tanstackStart.getOpenApiRootMethods();
export const ServerRoute = createServerFileRoute('/api').methods(methods);
```
Schema Route:

```typescript
// file: src/routes/schema.ts
import {createServerFileRoute} from '@tanstack/react-start/server';
import {openapi} from '../backend/utils/openApiInstance';

const methods = openapi.wrappers.tanstackStart.createShemaMethods();
export const ServerRoute = createServerFileRoute('/schema').methods(methods);
```

Swagger:
```typescript
// file: src/routes/swagger.ts
import {createServerFileRoute} from '@tanstack/react-start/server';
import {openapi} from '../backend/utils/openApiInstance';

const methods = openapi.wrappers.tanstackStart.createSwaggerMethods('/schema');
export const ServerRoute = createServerFileRoute('/swagger').methods(methods);
```

Stoplight (Swagger Alternative):
```typescript
// file: src/routes/stoplight.ts
import {createServerFileRoute} from '@tanstack/react-start/server';
import {openapi} from '../backend/utils/openApiInstance';

const methods = openapi.wrappers.tanstackStart.createStoplightMethods('/schema');
export const ServerRoute = createServerFileRoute('/stoplight').methods(methods);
```

### Custom
You don't have to use a wrapper to integrate OpenAPI with your framework. It's actually fairly simple to mount it on any framework: OpenAPI simply takes a Request object and returns this object:
```typescript
{
  status: number,
  body: object
}
```
Here's the code for the Express wrapper:
```typescript
public createOpenApiRootRoute(expressApp: ExpressApp): void {
    const route = this.service.getBasePath();
    // Handler simply creates a basic Request object from Express Request
    // and passes it to the OpenAPI instance (this.service)
    const handler: ExpressHandler = async (req, res) => {
      const emptyHeaders: Record<string, string> = {};
      // Correcting the type for headers a little bit; you can do it with casting to any
      const headers = Object.entries(req.headers).reduce((acc, val) => ({
        ...acc,
        ...(typeof val[1] === 'string' ? {[val[0]]: val[1]} : {}),
      }), emptyHeaders);
      const url = format({
        protocol: req.protocol,
        host: req.host,
        pathname: req.originalUrl,
      });
      const openApiRequest = new Request(url, {
        body: req.body,
        headers: headers,
        method: req.method,
      });
      const result = await this.service.processRootRoute(route, openApiRequest);
      res.status(result.status).header('Content-Type', 'application/json').json(result.body);
    };
    // Assigning the same handler for every HTTP method matching our API base path
    const regex = new RegExp(`${route}.*`);
    expressApp.get(regex, handler);
    expressApp.post(regex, handler);
    expressApp.patch(regex, handler);
    expressApp.delete(regex, handler);
    expressApp.put(regex, handler);
  }
```
As you can see, it's not rocket science to integrate it with any framework.

## Adding Routes

Now let's get deeper with Strap-On OpenAPI. Let's add some hot action.

We need to create a route and then add it to our OpenAPI instance. I recommend using a separate file for each route and one more file for the route map:
```typescript
// file: src/openapi/getCars.ts
export const getCars = openapi.factory.createRoute({
    type: OpenApiSampleRouteType.Public,
    method: OpenApiMethods.GET,
    path: "/get",
    description: "Returns list of cars in stock",
    validators: {
        query: z.object({
          make: z.string().optional().openapi({description: 'Car make filter'}),
        }),
        response: z.object({       
            name: z.string().openapi({description: 'Car name'}),
            make: z.string().openapi({description: 'Make'}),
            averageDriverIQ: z.number().openapi({description: "Average driver's IQ according to studies"}),
            updatedAt: z.date().openapi({description: 'Last time the record was updated'}),
        }).array().openapi({description: 'List of cars'}),
    },
    handler: async (ctx) => {
        const m3 = {
            name: "M3",
            make: "BMW",
            averageDriverIQ: 80,
            updatedAt: new Date()
        }
         const supra = {
            name: "Supra",
            make: "Toyota",
            averageDriverIQ: 130,
            updatedAt: new Date()
        }
        const result = [m3, supra];
        const filterValue = ctx.params.query.make;
        if (!filterValue) {
          return result;
        }
        return result.filter(x => x.make === filterValue);
    }
})
```
Now let's create a route map:
```typescript
// file: src/openapi/routes.ts
import {OpenApiRouteMap, OpenApiSampleRouteType} from 'strap-on-openapi';
import {getCars} from './getCars';

export const openApiRoutes: OpenApiRouteMap<OpenApiSampleRouteType> = {
  '/cars': [
    getCars,
  ]
}
```
Finally, we need to add our route map to the OpenAPI instance:
```typescript
// file: depends on your framework
openapi.addRouteMap(openApiRoutes);
```

Now the new route should appear in your Swagger or Stoplight documentation, and you can send a request to test it out.

```json
[
  {
    "name": "M3",
    "make": "BMW",
    "averageDriverIQ": 80,
    "updatedAt": "2025-06-25T22:32:37.698Z"
  }, 
  {
    "name": "Supra",
    "make": "Toyota",
    "averageDriverIQ": 130,
    "updatedAt": "2025-06-25T22:32:37.698Z"
  }
]
```

The code sample above is a little overloaded with information. In a developed application, routes look much cleaner than that. Here's an example from a real project:

```typescript
export const upsertExercises = openApiInstance.factory.createRoute({
  method: OpenApiMethods.PUT,
  type: ApiRouteType.User,
  description: 'Updates or inserts exercise in users personal library',
  path: '/',
  validators: {
    body: z.object({
      items: exerciseUpsertDtoValidator.array(),
    }),
    response: z.object({
      items: exerciseValidator.array(),
    }),
  },
  handler: async (ctx) => {
    const result = await ctx.services.models.exercise.upsert(ctx.viewer.id, ctx.params.body.items);
    return {items: result};
  },
});
```
And you can always write your own wrapper function to make it even less verbose if you need to.

## Default Route Fields

- **Path**  
  Defines how the route looks. You can have parameters in the path using this syntax: `/getCar/{id}`

- **Method**  
  HTTP method (POST, GET, PUT, DELETE, PATCH). GET routes don't have body validators.

- **Description**  
  The description of the route, which will appear in the schema file and documentation. With default configuration, documentation check is forced and you will get a runtime error if it's empty (or too short).

- **Type**  
  Routes can be of different types, and those types are defined by you. If you don't provide route types, it defaults to `OpenApiSampleRouteType`, which only has public routes. Route types can have different extra fields in route definition and different contexts (middlewares).

  Classic route types are public, user (which requires authorization), and admin (which has permissions on routes).

- **Validators**  
  Validators for input and output. This is an integral part of each route since you will only get access to the data that has been validated and only be able to return valid data in your response. The types are inferred from the shapes of the validators.

- **Handler**  
  Basically a controller for your route. It takes the context, which only contains body, path, and request parameters, and should return the response that fits the shape of the response validator.

  It's intentional that you don't get headers and cookies here. By default, you only get the minimal viable things you need in order to operate. You can always add extra information by creating different contexts for your route types.

## Configuration

Strap-On OpenAPI comes with a default configuration that covers basic errors and provides public route types. You can start with that, but eventually you will grow out of it.

There are two ways to configure Strap-On OpenAPI:
1. Inferred config (recommended at the beginning)
2. Implement OpenApiConfig interface

### Inferred configuration
`OpenApi` is packaged with a builder that allows you to configure OpenAPI with a number of chained calls to various configuration methods.

Some calls are optional and some are required. If you're using a modern IDE such as VSCode, you can simply follow Intellisense. Each configuration call returns a new instance of the builder with specific updated methods. The `create()` method finalizes the build process and returns an OpenApi instance.

Initially, you have these options:

1. `customizeErrors()`
   Allows you to configure different error types, their response shapes, and lets you create the error handler that serves configured responses.
2. `customizeRoutes()`
   Allows you to configure different route types and their settings: additional route fields, contexts, authentication methods.
3. `defineGlobalConfig()`  
   Allows you to configure general settings such as the base path where the API handles requests, servers where this API is available, and other miscellaneous settings.
4. `create()`  
   Creates an instance of OpenApi.

These calls depend on each other and have to be called in the same order as they've been written above. You can call any of these methods, but if you called `customizeRoutes()`, you won't be able to call `customizeErrors()`.

This is done in such a manner to allow the TypeScript compiler to correctly pick up inferred types.

### Global Configuration
```typescript
const api = OpenApi.builder.defineGlobalConfig({
  basePath: "/my-custom-api-path",
  apiName: 'My Cool API',
  servers: [
    {
      description: 'Local',
      url: 'http://localhost:3000/my-custom-api-path',
    },
    {
      description: 'Prod',
      url: 'https://mydomain.com/my-custom-api-path',
    }
  ],
  logLevel: OpenApiLogLevel.All,
  skipDescriptionsCheck: false
}).create()
```
If you override here, don't forget to fill in servers. Documentation generators come with playgrounds. These allow you to quickly test your API.

### Configuring Routes
Let's create custom route types for authenticated users:
```typescript
  enum ApiRouteType {
    Public = 'Public',
    Member = 'Member',
  }

  export const api = OpenApi.builder.customizeRoutes(
    ApiRouteType
  ).defineRoutes({
      [ApiRouteType.Public]: {
          authorization: false,
      },
      [ApiRouteType.Member]: {
          authorization: true, // only affects schema
      }
  }).create()
```
After the `customizeRoutes()` call, we can define extra properties for our routes with Zod validators. Let's block access of the members to premium areas.

```typescript
// Defining different subscription types for our members
enum Subscription {
    Free = 'Free',
    Premium = 'Premium',
}
export const api = OpenApi.builder.customizeRoutes(
  ApiRouteType
).defineRouteExtraProps({
    [ApiRouteType.Public]: undefined,
    [ApiRouteType.Member]: z.object({
        subscription: z.nativeEnum(Subscription)
    })
}).defineRoutes({
    [ApiRouteType.Public]: {
        authorization: false,
    },
    [ApiRouteType.Member]: {
        authorization: true,
    }
}).create();

// Now we can fill in subscription on member routes
const route = api.factory.createRoute({
    type: ApiRouteType.Member,
    method: OpenApiMethod.GET,
    path: "/premium-analytics",
    description: "Analytics for premium members",
    validators: premiumAnalyticsValidator,
    handler: function (context) {
      // code that serves premium analytics to the member
    },
    subscription: Subscription.Premium // now we have this field here
})
```
At the moment, this example is incomplete. Let's use our new field in the middleware that serves the context for member routes. It's called the context factory and it receives one parameter that contains information about the route, request objects, and some other properties.

```typescript
export const api = OpenApi.builder.customizeRoutes(
    ApiRouteType
).defineRouteExtraProps({
    [ApiRouteType.Public]: undefined,
    [ApiRouteType.Member]: z.object({
        subscription: z.nativeEnum(Subscription)
    })
}).defineRouteContexts({
    [ApiRouteType.Public]: () => Promise.resolve({}),
    [ApiRouteType.Member]: async (ctx) => {
        // obtaining user
        const user: User | null = getUserFromRequest(ctx.request)
        if (!user) {
          throw new UnauthorizedError();
        }
        if (ctx.route.subscription !== user.subscription) {
            throw new SubscriptionMismatchError(user);
        }
        // this object will be accessible in each Member route
        return {user}
    }
}).defineRoutes({
    [ApiRouteType.Public]: {
        authorization: false,
    },
    [ApiRouteType.Member]: {
        authorization: true,
    }
}).create();

const route = api.factory.createRoute({
    type: ApiRouteType.Member,
    method: OpenApiMethod.GET,
    path: "/me",
    description: "Analytics for premium members",
    validators: userValidator,
    handler: function (context) {
      // the context values are visible in the routes
      return context.user
    },
    subscription: Subscription.Free
})

```
Note that route functions depend on each other and have to be called in this order:
1. customizeRoutes()
2. defineRouteExtraProps()
3. defineRouteContexts()
4. defineRoutes()

### Configuring Errors
The configuration of errors starts with defining the Error Enum that contains all possible kinds of error responses you plan to use. You can go with as few as one error.

At this stage, it's important to recognize that we have two distinct entities here:
1. Errors. To create an error in your service or route handler, you simply need to throw an Error there. Any normal JavaScript throwable object will do fine.
2. Error responses. You can have a number of error responses for each kind of route.

With that said, you can see that you don't have to list all possible kinds of errors in your Error Enum—only errors that have a unique type of response or HTTP status.

> [!NOTE] Every error that can be thrown corresponds to one or multiple error responses. Whatever happens during API call processing, the consumer will 
> always receive a response. That's why Strap-On OpenAPI requires at least one error response to be defined: it has to have the default error.

The `customizeErrors()` call will set you on the path of configuring errors. Similar to `customizeRoutes()`, you won't be able to call `create()` until you have provided everything required for the API to function properly.

Then we need to define responses for these errors by calling `defineErrors()`. It's done by setting the correct HTTP statuses, providing descriptions, and the validators for errors.
```typescript
export enum AppErrorType {
  Unknown = "Unknown",
  Unauthorized = "Unauthorized",
  ActionError = "ActionError",
}
export const openApi = OpenApi.builder.customizeErrors(
  AppErrorType
).defineErrors({
    [AppErrorType.Unknown]: {
      status: "500",
      description: "Unknown Error",
      responseValidator: z.object({
        code: z.literal(AppErrorType.Unknown),
      }),
    },
    [AppErrorType.ActionError]: {
      status: "400",
      description: "Error with human-readable explanation of what went wrong. Usually happens on action endpoints (i.e. login).",
      responseValidator: z.object({
        code: z.literal(AppErrorType.ActionError),
        humanReadable: z.string(),
      }),
    },
    [AppErrorType.Unauthorized]: {
      status: "401",
      description: "Unauthorized Error",
      responseValidator: z.object({
        code: z.literal(AppErrorType.Unauthorized),
      }),
    },
  })
```
After this is done, you will be prompted to call `defineDefaultError()`. This call is designed to configure the error that is going to be output to the consumer in case something unexpected happens. Naturally, it should correspond to one of your errors with HTTP status 500. It takes an object that consists of a value of the Error enum and the response that corresponds to its validator.

```typescript
export const openApi = OpenApi.builder.customizeErrors(
  AppErrorType
).defineErrors({
  ...
  })
  .defineDefaultError({
    code: AppErrorType.Unknown,
    body: {
      code: AppErrorType.Unknown, // this is not a duplication, it follows from the definition of response
      // some developers may choose a different shape, not related to the backend error types 
    },
  })
```

> [!NOTE]
> Note that the interface of `defineDefaultError` forces you to use synchronous context. It's no coincidence: errors may happen during your own error handling. This approach guarantees that whatever happens, we always have a suitable response ready.

The last thing we need to do is write the error handler itself. Strap-On OpenAPI can't magically know what error to respond with; the best it can do is respond with the default error response.

Surprisingly enough, the last call related to error handling is `customizeGlobalConfig()`, which was already covered above. The reason why it's done this way is to allow you to tweak error handling when you work with `DefaultConfig`. The built-in error types are quite good, and many people may prefer to use them for a while before actually setting up their own error responses.

```typescript
// adds nothing to the table, except allowing us to use instanceOf() on it
export class UnauthorizedError extends Error {}
export class ActionError extends Error {
  protected code: ActionErrorCode;

  constructor(code: ActionErrorCode) {
    super();
    this.code = code;
  }

  getCode() {
    return this.code;
  }
}
export const actionErrorDescriptions: Record<ActionErrorCode, string> = {
  [ActionErrorCode.WrongCredentials]: "Email or Password is incorrect",
  [ActionErrorCode.UserAlreadyExists]: "User with this email already exists",
  [ActionErrorCode.UserPasswordNotConfirmed]: "Password confirmation is wrong",
  [ActionErrorCode.InvalidDataInRequest]: "The data in request is missing or has wrong format",
};

export const openApi = OpenApi.builder.customizeErrors(
    AppErrorType
  ).defineErrors({
   ...
  })
  .defineDefaultError({
   ...
  })
  .defineGlobalConfig({
    basePath: "/api",
    handleError: (e) => {
      // processing my custom authorization error
      if (e instanceof UnauthorizedError) {
        const body: UnauthorizedErrorResponse = {
          code: AppErrorType.Unauthorized,
        };
        return { code: AppErrorType.Unauthorized, body };
      }
      // Here I chose to respond with action error response for built-in validation error
      if (e instanceof OpenApiValidationError) {
        const body: ActionErrorResponse = {
          code: AppErrorType.ActionError,
          humanReadable:
            actionErrorDescriptions[ActionErrorCode.InvalidDataInRequest],
        };
        return { code: AppErrorType.ActionError, body };
      }
      // Processing my custom action errors
      if (e instanceof ActionError) {
        const code = e.getCode();
        const body: ActionErrorResponse = {
          code: AppErrorType.ActionError,
          humanReadable: actionErrorDescriptions[code],
        };
        return { code: AppErrorType.ActionError, body };
      }
      // default response
      const defaultResponse: UnknownErrorResponse = {
        code: AppErrorType.Unknown,
      };
      return { code: AppErrorType.Unknown, body: defaultResponse };
    },
  })
  .create();
```
### Built-in Errors
There are three kinds of built-in error responses:
1. NotFound. Happens if the consumer tries to hit a route that doesn't exist. Keep in mind that this error may only happen 
2. ValidationFailed. This happens when the data sent in the request or response hasn't passed validation. If validation fails in the response, then the API won't output this data to the consumer. It will be converted to an Unknown Error response for security reasons.
3. UnknownError. This is the default error that happens on exceptions that weren't properly handled.

Under default error configuration, each of these gets its own response.

All built-in errors inherit from the class `BuiltInError`, which has a `getCode()` method to specify the error code listed above. In your `handleError()`, you may check if the error is an instance of `OpenApiBuiltInError` or `OpenApiValidationError` and shape your response accordingly.

## Path Math
Routing paths are defined as strings starting with `/`. Paths can be `/`, `/something`, `/something/something`, and so on. Each route has a path, and each RouteMap piece has a path. It's very convenient to nest paths, as it allows moving routes around using RouteMap quickly.

`/` is considered to be an empty path. Empty paths collapse (are ignored) when being added to each other.

`/ + / = /`

`/ + /something = /something`

You don't have to think twice when you decide on the shape of the routes. Just put `/` if you don't want this RoutePart to have any effect.

>This is possible because it's a REST API and API routing is far more simplistic than website routing.

There are three kinds of RoutePath used for every route:
1. Base path, which defines the path where OpenAPI sits relative to the domain name of the application. Usually, it's something like `/api` or `/api/v1`.
2. Route group path, which defines the path for a group of routes. Usually, something like `/cars` or `/users`.
3. Route path, which is the path of the route itself. It can be anything: an empty route `/`, a parameter `/${id}`, or an action `/get`.

The final route is the sum of all three pieces: base path + group path + route path. Something like `/api/v1/users/${id}`.

You don't have to utilize all three paths. It's up to you. It's absolutely possible to operate only with route paths by putting empty routes for other kinds