const dotenv = require("dotenv");
dotenv.config();

const loadEnvVariables = () => {
    const requiredVariables = ["DB_USER", "DB_HOST", "DB_NAME", "DB_PASSWORD", "DB_PORT", "JWT_SECRET", "NODE_ENV"];

    requiredVariables.forEach((key) => {
        if (!process.env[key]) {
            throw new Error(`Missing require environment variables ${key}`);
        }
    });

    console.log({
        DB_USER: process.env.DB_USER,
        DB_HOST: process.env.DB_HOST,
        DB_NAME: process.env.DB_NAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_PORT: process.env.DB_PORT,
        JWT_SECRET: process.env.JWT_SECRET,
        NODE_ENV: process.env.NODE_ENV
    })

    return {
        DB_USER: process.env.DB_USER,
        DB_HOST: process.env.DB_HOST,
        DB_NAME: process.env.DB_NAME,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_PORT: process.env.DB_PORT,
        JWT_SECRET: process.env.JWT_SECRET,
        NODE_ENV: process.env.NODE_ENV
    }
};

const envVars = loadEnvVariables();

module.exports = envVars