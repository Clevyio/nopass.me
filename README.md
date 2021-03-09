# NoPass.me - Passwordless MFA Authentication API

NoPass.me is an open-source passwordless account verification solution, available as a service over at [NoPass.me](https://nopass.me), or easily deployable on any AWS account with [serverless](https://serverless.com).

![](./images/illustration.png)

Using this service, you can easily authenticate a user's email address by sending them a one-time password with a configurable validity duration, which you can then validate accordingly.

[NoPass.me](https://nopass.me) has been crafted with ❤️  by the [Clevy](https://clevy.io) team in Paris, France.

👉 **Check out our other projects, such as [CSML](https://CSML.dev), an open-source programming language built to design powerful chatbot experiences.**

## Main features

This is a light alternative to some other (more expensive) services such as Auth0, Okta, etc. If all you are looking for is a lightweight, fully transparent, and open-source solution to send one-time passwords to email addresses (and soon to SMS numbers as well) and validate them afterwards, this solution is perfect for you!

### 🥸 Validate Email Address Claims

The very purpose of [NoPass.me](https://nopass.me) is to make sure that a user claiming to be i.e jane.doe@bigcorp.com actually has physical access to that email address. You still have to make sure they are allowed to do what they want to do, but at least you can confidently say that: yes, they are indeed Jane Doe from BigCorp, or someone who has access to their mailbox! 

### 🔐 Security By Design

As you can verify by yourself in this open-source code:
- no email address is ever stored in cleartext
- all sensitive data is hashed with sha256
- all entries are automatically cleared (with a TTL mechanism) after the code expires
- any wrong input results in the target's data being wiped

### 🤯 SaaS or Self-Hosted

NoPass.me is available both as a SaaS API (request an API key on [NoPass.me](https://nopass.me)) or a self-hosted solution using this very code. You can actually deploy it automatically to your own AWS account using the Github Actions in this very repo! (or read below if you are interested in the _Manual Way™_).

### 🌟 Free to Use, Modify, Distribute

This code relies on a lot of other people's work, and we think that you should be able to deploy this solution on your own servers if you like. If using this makes you happy, then we're happy too 🥰

### ☁️ Multi-Cloud (if you want it to be)

So, we like AWS a lot. But it should be easy to adapt for other cloud providers, or even on-premise plain old servers. Feel free to send us a PR and we'll add your favorite cloud provider!

At its heart, NoPass.me is based on express.js. Supporting SMTP or other email services is an easy add, and we will probably provide a MongoDB binding soon. Once that's done, you will be able to deploy this solution anywhere you like! 🥳

## Setup

To setup the solution on your own machine, you simply need to run:

```sh
npm install
```

Then, copy the .env.example file to .env and adjust the values to your liking.

### Run locally

To run the solution locally (**for development purposes only**!), you can simply execute this script:

```sh
npm start
```

The api will run on http://localhost:3600 (this can be configured in the [serverless.yml file](./serverless.yml)).

It can be used with [dynamodblocal](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html). Simply launch dynamodb and configure the host/port accordingly in the .env.local file.

> Note: in local mode, emails are not actually sent out, but printed in the console. 


### Deployment

To deploy nopass.me on your own AWS account, simply run:

```sh
npx serverless deploy -s v1 -r YOUR_AWS_REGION
```

This script will create a CloudFormation stack, and generate/configure the required resources. It is entirely serverless: it runs on API Gateway, Lambda, DynamoDB and SES. The actual hosting cost of the solution only depends on the number of requests made to the API, but it should hardly go above 1$/month unless under very heavy traffic.

## Contributing

Feel free to open PRs and issues. We'll review them as they come. Also feel free to share the love on twitter and all 🤗
