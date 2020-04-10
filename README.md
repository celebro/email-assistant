Docker packed node application to monitor new messages at `https://vrtec.easistent.com` and send emails with full message content.

### Instructions

-   Create ./data/config.json and fill with:

    ```json
    {
        "username": "<username>",
        "password": "<password",
        "emailServer": {
            // directly passed to nodemailer (https://nodemailer.com/about/),
            "host": "<email server, e.g. smtp.gmail.com>",
            "secure": true,
            "auth": {
                "user": "<email username>",
                "pass": "<email password"
            }
        },
        "emailFrom": "<email from>",
        "emailTo": "<email to",
        "logLevel": 0
    }
    ```

-   Start the docker container:
    ```bash
    docker-compose up -d
    ```
