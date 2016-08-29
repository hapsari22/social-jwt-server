# Facebook JWT Server

This docker image defines an Authentication Server that respond to Facebook tokens with JWT.
It is based on this article: https://ole.michelsen.dk/blog/social-signin-spa-jwt-server.html .

## Environment variables

* `TOKEN_SECRET_KEY` : Symmetric key you should not share with anyone except your own applications.
* `TOKEN_EXPIRATION`: _e.g._ '2d'. Check https://github.com/auth0/node-jsonwebtoken for more details
* `TOKEN_ISSUER`: identifies principal that issues the tokens (_e.g._ your application domain)
* `FACEBOOK_APP_ID`
* `FACEBOOK_SECRET_KEY`: only required if you want long-lived token

## Endpoints

Two endpoints are exposed:
* `POST /auth`: Post an object with two attribute as the payload:
```
{
  socialToken: 'the facebook token',
  longLived:   false
}
```

If long-lived is `true`, this endpoint will return a Facebook Long-Lived Token provided by Facebook. The `FACEBOOK_SECRET_KEY` environment variable must be set.

* `GET /secure`: Pass your JWT token as a query string `jwt` to verify it

## Start container with docker CLI

For example:

```
docker run --name authentication-server \
  -p 1337:3000 \
  -e TOKEN_ISSUER=https://kiss-my-app.be \
  -e TOKEN_EXPIRATION=2d \
  -e TOKEN_SECRET_KEY=eb9d62e5427c4c8f7ce043d14ec8e42ea86972c91236edd1df4f4e1c06d623ca \
  -e FACEBOOK_APP_ID=183740293593225 \
  looorent/facebook-jwt-server
```

## Start container with Docker Compose

```
authentication-server:
    image: looorent/facebook-jwt-server
    container_name: authentication-server
    ports:
      - "1337:3000"
    environment:
      TOKEN_ISSUER: https://kiss-my-app.be
      TOKEN_EXPIRATION: 2d
      TOKEN_SECRET_KEY: eb9d62e5427c4c8f7ce043d14ec8e42ea86972c91236edd1df4f4e1c06d623ca
      FACEBOOK_APP_ID: 183740293593225
```

## Future work

* CORS
* Implement other providers
* Performance tuning
* Configure encryption algorithm
* Use a perf-oriented technology? (Go, bla bla bla)
