AWS serverless (lambda / dynamodb) or Docker packed node application to monitor new messages at `https://vrtec.easistent.com` and send emails with full message content.

## SLS

### Email

Sender and recepient emails needs to be verified https://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-email-addresses-procedure.html

```sh
aws ses verify-email-identity --email-address sender@example.com
```

### Local Dynamodb for development

Run once to install the plugin to sls installation

```sh
sls plugin install --name serverless-dynamodb-local
```

Install local dynamo instance, either as docker image

```sh
docker run --name dynamo -p 8000:8000 amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb
sls dynamodb migrate
```

or directly from the plugin

```sh
sls dynamodb install
sls dynamodb start
```

### Configuration

-   Create .env and fill with:

    ```env
    EASISTENT_USERNAME=username
    EASISTENT_PASSWORD=password
    EMAIL_FROM="EMAIL eAsistent" <email@example.com>
    EMAIL_TO=a@example.com,b@example.com

    ```
