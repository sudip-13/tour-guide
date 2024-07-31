import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config({ path: "./.env" });
import router from './routes/flight';
import AuthRouter from './routes/auth';
import home from './routes/home';
import gettrain from './routes/getTrains';
import weatherRouter from './routes/weather'
import webHookRouter from './routes/webhook';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

async function init() {
    const PORT: string | undefined = process.env.PORT;

    if (!PORT) {
        console.error("Environment variables and PORT must be provided.");
        return;
    }

    const app = express();

    // CORS configuration
    const corsOptions = {
        origin: (origin:any, callback:any) => {
            const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: ['Content-Type', 'Authorization']
    };

    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // Log origin of requests for debugging
    app.use((req, res, next) => {
        console.log('Origin:', req.headers.origin);
        next();
    });

    // Routes
    app.use("/flight", router);
    app.use("/", home);
    app.use("/auth", AuthRouter);
    app.use("/trains", gettrain);
    app.use("/weather", weatherRouter);
    app.use("/webhook", webHookRouter);

    await prisma.$connect()
        .then(() => {
            console.log('Connected to the database');
        })
        .catch((error) => {
            console.error(error);
        });

    app.listen(PORT, () => {
        console.log(`server is running on http://localhost:${PORT}`);
    });
}

init();
