# Social JWT Server

This docker image defines an Authentication Server that respond to Social tokens with JWT, including Facebook and Google.
It is originally based on this article: https://ole.michelsen.dk/blog/social-signin-spa-jwt-server.html .

## Environment variables

### Common properties

* `TOKEN_SECRET_KEY` : Symmetric key you should not share with anyone except your own applications.
* `TOKEN_EXPIRATION`: _e.g._ '2d'. Check https://github.com/auth0/node-jsonwebtoken for more details
* `TOKEN_ISSUER`: identifies principal that issues the tokens (_e.g._ your application domain)
* `TOKEN_ALGORITHM`: which Signin algorithm to use. Optional. Default: HS512. To see all supported algorithms: https://github.com/auth0/node-jsonwebtoken
* `CORS_DOMAINS`: Specify this variable to give cross-domain headers in every response. Optional. Default value: "*". Can be a String (if it starts with `http`) or a Regexp. Check [Documentation](https://github.com/expressjs/cors) for more details.
* `PORT`: The port the server listens to. Optional. Default value: 3000

### Facebook

* `FACEBOOK_APP_ID`: only required if you want to enable Facebook authentication
* `FACEBOOK_SECRET_KEY`: only required if you want a long-lived token
* `FACEBOOK_VERSION`: e.g. `v2.8`

### Google

* `GOOGLE_APP_ID`: only required if you want to enable Google authentication
* `GOOGLE_SECRET_KEY`: only required if you want a refresh token (`long-lived = true`)

Google authentication works for the "one-time code" server-side flow. see https://developers.google.com/identity/sign-in/web/server-side-flow

## Endpoints

Two endpoints are exposed:
* `POST /auth`: Request an Application JWT based on a given social token.


* `GET /secure`: Pass your JWT token as a query string `jwt` to verify it

## Start container with docker CLI

For example, a Facebook JWT server can be started with:

```
docker run --name authentication-server \
  -p 1337:3000 \
  -e TOKEN_ISSUER=https://kiss-my-app.be \
  -e TOKEN_EXPIRATION=2d \
  -e TOKEN_SECRET_KEY=eb9d62e5427c4c8f7ce043d14ec8e42ea86972c91236edd1df4f4e1c06d623ca \
  -e FACEBOOK_APP_ID=183740293593225 \
  looorent/social-jwt-server
```

## Start container with Docker Compose

```
authentication-server:
    image: looorent/social-jwt-server
    container_name: authentication-server
    ports:
      - "1337:3000"
    environment:
      TOKEN_ISSUER: https://kiss-my-app.be
      TOKEN_EXPIRATION: 2d
      TOKEN_SECRET_KEY: eb9d62e5427c4c8f7ce043d14ec8e42ea86972c91236edd1df4f4e1c06d623ca
      FACEBOOK_APP_ID: 183740293593225
```

## Sample 1 - `/auth` for Facebook authentication

If you want to request an Application JWT based on a Facebook access token, your `POST` request must have this payload:
```
{
  facebookToken: '<the facebook OAuth2 access token>',
  longLived:   false
}
```
This endpoints responds with:
```
{
  accessToken: "XXX",
  socialToken: "YYY"
}
```
Where
* `accessToken` is the JWT you requested
* `socialToken` is the Facebook access token (possibly a long-lived one)

If long-lived is `true`, this endpoint will return a Social Long-Lived Token provided by Facebook. The `FACEBOOK_SECRET_KEY` environment variable must be set.


## Sample 2 - `/auth` for  Google authentication

If you want to request an Application JWT based on a Google one-time code, your `POST` request must have this payload:
```
{
  googleOneTimeCode: '<the google one-time code of your server-side flow>',
  longLived:   true
}
```
This endpoints responds with:
```
{
  accessToken: "XXX",
  socialToken: {
    accessToken: "YYY",
    refreshToken: "ZZZ"
  }
}
```
Where
* `accessToken` is the JWT you requested
* `socialToken` is the Google access token
* `refreshToken` is the Google refresh token; not present if the `longLived` is set to `false`.

To receive a refresh token, both conditions must be met:
* The `FACEBOOK_SECRET_KEY` environment variable must be set.
* `longLived` must be set to `true`

## Future work

* Performance tuning
* Use a perf-oriented technology? (Go, bla bla bla)
