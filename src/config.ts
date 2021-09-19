import * as dotenv from 'dotenv';

// For local runs
if (!process.env.AWS_REGION) {
    dotenv.config();
}

const config = {
    easistentUsername: process.env.EASISTENT_USERNAME as string,
    easistentPassword: process.env.EASISTENT_PASSWORD as string,
    emailFrom: process.env.EMAIL_FROM as string,
    emailTo: process.env.EMAIL_TO as string,
    inAws: !!process.env.AWS_REGION,
    tableName: process.env.DYNAMODB_TABLE as string,
    logLevel: 2,
};

const configOptionsWithUndefined = Object.entries(config)
    .filter((entry) => entry[1] === undefined)
    .map((entry) => entry[0]);
if (configOptionsWithUndefined.length > 0) {
    throw new Error(`Config options "${configOptionsWithUndefined.join(',')}" are undefined`);
}

export default config;
