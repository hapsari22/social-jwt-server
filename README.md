# Social JWT Server

This docker image defines an Authentication Server that respond to Social tokens with JWT, including Facebook and Google.
It is originally based on this article: https://ole.michelsen.dk/blog/social-signin-spa-jwt-server.html .

## Environment variables

* `TOKEN_SECRET_KEY` : Symmetric key you should not share with anyone except your own applications.
* `TOKEN_EXPIRATION`: _e.g._ '2d'. Check https://github.com/auth0/node-jsonwebtoken for more details
* `TOKEN_ISSUER`: identifies principal that issues the tokens (_e.g._ your application domain)
* `TOKEN_ALGORITHM`: which Signin algorithm to use. Optional. Default: HS512. To see all supported algorithms: https://github.com/auth0/node-jsonwebtoken
* `FACEBOOK_APP_ID`: only required if you want to enable Facebook authentication
* `FACEBOOK_SECRET_KEY`: only required if you want long-lived token
* `GOOGLE_APP_ID`: only required if you want to enable Google authentication
* `CORS_DOMAINS`: Specify this variable to give cross-domain headers in every response. Optional. Default value: "*"
* `PORT`: The port the server listens to. Optional. Default value: 3000

## Endpoints

Two endpoints are exposed:
* `POST /auth`: Post an object with two attribute as the payload:
```
{
  facebookToken: 'the facebook token if facebook is the social network to use to authenticate',
  googleToken: 'the google token if google is the social network to use to authenticate',
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
* `socialToken` is the Facebook/Google access token (possibly a long-lived one)

If long-lived is `true`, this endpoint will return a Social Long-Lived Token provided by Facebook or Google (depending on the request body). The relevant `FACEBOOK_SECRET_KEY` and/or `GOOGLE_SECRET_KEY` environment variable must be set.

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

## Sample 1 - Facebook authentication

TODO

## Sample 2 - Google authentication

TODO

## Future work

* Better documentation
* Long-lived token for google provider
* Performance tuning
* Use a perf-oriented technology? (Go, bla bla bla)
